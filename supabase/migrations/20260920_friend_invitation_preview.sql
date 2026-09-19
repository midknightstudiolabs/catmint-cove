-- Durable invite limits survive removal; exact-code preview shares only name/code.
begin;
create table public.neo_friend_actions(id bigint generated always as identity primary key,owner uuid not null references auth.users(id) on delete cascade,kind text not null check(kind in ('preview','request')),created_at timestamptz not null default now());
create index neo_friend_actions_owner_time on public.neo_friend_actions(owner,kind,created_at);
alter table public.neo_friend_actions enable row level security;
revoke all on public.neo_friend_actions from public,anon,authenticated;
create or replace function public.neo_social(action text,payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();peer uuid;r public.neo_friends;result jsonb;nm text;
begin
 if me is null then raise exception 'Please sign in first.';end if;
 if action='join' then
  nm:=trim(payload->>'name');if nm is null or char_length(nm) not between 1 and 24 then raise exception 'Use a name of 1–24 characters.';end if;
  insert into public.neo_profiles(id,name) values(me,nm) on conflict(id) do update set name=excluded.name;
  return (select jsonb_build_object('code',code,'name',name) from public.neo_profiles where id=me);
 end if;
 if not exists(select 1 from public.neo_profiles where id=me) then raise exception 'Choose your Cove name first.';end if;
 if action='list' then
  return jsonb_build_object('profile',(select jsonb_build_object('code',code,'name',name) from public.neo_profiles where id=me),'shared_at',(select updated_at from public.neo_snapshots where owner=me),'friends',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'status',f.status,'incoming',f.recipient=me,'shared_at',s.updated_at)) from public.neo_friends f join public.neo_profiles p on p.id=case when f.sender=me then f.recipient else f.sender end left join public.neo_snapshots s on s.owner=p.id where (f.sender=me or f.recipient=me) and f.status<>'blocked'),'[]'::jsonb),'hellos',(select count(*) from public.neo_greetings where recipient=me and day=current_date));
 elsif action in ('preview','request') then
  perform pg_advisory_xact_lock(hashtextextended(me::text,194));
  if (select count(*) from public.neo_friend_actions where owner=me and kind=action and created_at>now()-interval '1 day') >= (case when action='preview' then 30 else 10 end) then raise exception 'Try more invitations tomorrow.';end if;
  select id into peer from public.neo_profiles where code=upper(regexp_replace(payload->>'code','[^a-zA-Z0-9]','','g'));
  if peer is null or peer=me then raise exception 'Check that friend code.';end if;
  if (select count(*) from public.neo_friends where sender=me or recipient=me)>=50 then raise exception 'Your friends list is full.';end if;

  perform pg_advisory_xact_lock(hashtextextended(least(me,peer)::text||greatest(me,peer)::text,0));
  if exists(select 1 from public.neo_friends where(sender=me and recipient=peer)or(sender=peer and recipient=me))then raise exception 'This invitation is unavailable or already in your list.';end if;
  insert into public.neo_friend_actions(owner,kind)values(me,action);
  if action='preview' then return (select jsonb_build_object('name',name,'code',code) from public.neo_profiles where id=peer);end if;
  insert into public.neo_friends(sender,recipient)values(me,peer);
 elsif action='publish' then
  if exists(select 1 from public.neo_snapshots where owner=me and updated_at>now()-interval '30 seconds')then raise exception 'Please wait a moment before sharing again.';end if;
  insert into public.neo_snapshots(owner,picture)values(me,payload->>'picture')on conflict(owner)do update set picture=excluded.picture,updated_at=now();
 elsif action='unpublish' then delete from public.neo_snapshots where owner=me;
 elsif action='event' then
  if(select count(*)from public.neo_events where owner=me and created_at>now()-interval '1 day')<100 then insert into public.neo_events(owner,event)values(me,payload->>'event');end if;
 elsif action in ('accept','remove','block','visit','hello') then
  peer:=(payload->>'id')::uuid;
  select * into r from public.neo_friends where(sender=me and recipient=peer)or(sender=peer and recipient=me)for update;
  if not found or r.status='blocked' then raise exception 'This Cove is unavailable.';end if;
  if action='accept' then
   if r.recipient<>me or r.status<>'pending' then raise exception 'Only the recipient can accept.';end if;
   update public.neo_friends set status='accepted' where sender=r.sender and recipient=r.recipient;
  elsif action='remove' then delete from public.neo_friends where sender=r.sender and recipient=r.recipient;
  elsif action='block' then update public.neo_friends set status='blocked' where sender=r.sender and recipient=r.recipient;
  else
   if r.status<>'accepted' then raise exception 'Accept the invitation first.';end if;
   if action='visit' then
    select jsonb_build_object('picture',s.picture,'updated_at',s.updated_at,'name',p.name)into result from public.neo_snapshots s join public.neo_profiles p on p.id=s.owner where s.owner=peer;
    if result is null then raise exception 'Your friend has not shared their Cove yet.';end if;return result;
   else insert into public.neo_greetings(sender,recipient)values(me,peer)on conflict do nothing;end if;
  end if;
 else raise exception 'Unknown action.';end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.neo_social(text,jsonb)from public,anon;
grant execute on function public.neo_social(text,jsonb)to authenticated;
commit;
