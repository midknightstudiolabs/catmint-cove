-- Neo pilot. Opt-in snapshots only; no balances, purchases or game saves.
begin;
create table public.neo_profiles(id uuid primary key references auth.users(id) on delete cascade,code text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),name text not null check(char_length(name) between 1 and 24));
create table public.neo_friends(sender uuid references public.neo_profiles(id) on delete cascade,recipient uuid references public.neo_profiles(id) on delete cascade,status text not null default 'pending' check(status in ('pending','accepted','blocked')),created_at timestamptz not null default now(),primary key(sender,recipient),check(sender<>recipient));
create table public.neo_snapshots(owner uuid primary key references public.neo_profiles(id) on delete cascade,picture text not null check(length(picture)<=300000 and picture like 'data:image/webp;base64,%'),updated_at timestamptz not null default now());
create table public.neo_greetings(sender uuid references public.neo_profiles(id) on delete cascade,recipient uuid references public.neo_profiles(id) on delete cascade,day date default current_date,primary key(sender,recipient,day));
create table public.neo_events(id bigint generated always as identity primary key,owner uuid not null references auth.users(id) on delete cascade,event text not null check(event in ('edit_saved','snapshot_shared','visit_opened','hello_sent')),created_at timestamptz not null default now());
create index neo_friend_recipient on public.neo_friends(recipient);
create index neo_event_owner_time on public.neo_events(owner,created_at);
alter table public.neo_profiles enable row level security;
alter table public.neo_friends enable row level security;
alter table public.neo_snapshots enable row level security;
alter table public.neo_greetings enable row level security;
alter table public.neo_events enable row level security;
revoke all on public.neo_profiles,public.neo_friends,public.neo_snapshots,public.neo_greetings,public.neo_events from anon,authenticated;
create function public.neo_social(action text,payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
 elsif action='request' then
  select id into peer from public.neo_profiles where code=upper(regexp_replace(payload->>'code','[^a-zA-Z0-9]','','g'));
  if peer is null or peer=me then raise exception 'Check that friend code.';end if;
  if (select count(*) from public.neo_friends where sender=me or recipient=me)>=50 then raise exception 'Your friends list is full.';end if;
  if (select count(*) from public.neo_friends where sender=me and created_at>now()-interval '1 day')>=10 then raise exception 'Try more invitations tomorrow.';end if;
  perform pg_advisory_xact_lock(hashtextextended(least(me,peer)::text||greatest(me,peer)::text,0));
  if exists(select 1 from public.neo_friends where(sender=me and recipient=peer)or(sender=peer and recipient=me))then raise exception 'This invitation is unavailable or already in your list.';end if;
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
