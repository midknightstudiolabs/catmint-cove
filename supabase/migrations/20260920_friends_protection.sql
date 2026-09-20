begin;
create table public.neo_identity_links(principal uuid primary key references auth.users(id),owner uuid not null references auth.users(id),active boolean not null default true);
create table public.neo_recovery_keys(owner uuid primary key references auth.users(id),key_hash text unique not null,created_at timestamptz not null default now());
create table public.neo_identity_audit(id bigint generated always as identity primary key,owner uuid not null,principal uuid not null,action text not null,created_at timestamptz not null default now());
alter table public.neo_identity_links enable row level security;
alter table public.neo_recovery_keys enable row level security;
alter table public.neo_identity_audit enable row level security;
revoke all on public.neo_identity_links,public.neo_recovery_keys,public.neo_identity_audit from public,anon,authenticated;
create function public.neo_owner() returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); link public.neo_identity_links; target uuid;
begin
 if v_actor is null then raise exception 'Sign in to Friends first.';end if;
 select * into link from public.neo_identity_links where neo_identity_links.principal=v_actor;
 if found and not link.active then raise exception 'This Friends identity was recovered on another device.';end if;
 target:=coalesce(link.owner,v_actor);
 perform pg_advisory_xact_lock(hashtextextended(target::text,195));
 -- Recheck after the lock in case recovery revoked this session while waiting.
 if exists(select 1 from public.neo_identity_links l where l.principal=v_actor and not l.active) then raise exception 'This Friends identity was recovered on another device.';end if;
 return target;
end $$;
revoke all on function public.neo_owner() from public,anon,authenticated;
-- Keep all existing data owned by its original identity; only authenticated access changes.
do $$ declare signature text;definition text;begin
 foreach signature in array array['public.neo_social(text,jsonb)','public.neo_backup(text,text,uuid)','public.neo_recovery_case(text)'] loop
  definition:=pg_get_functiondef(signature::regprocedure);
  if position('auth.uid()' in definition)=0 then raise exception 'Unexpected owner function: %',signature;end if;
  execute replace(definition,'auth.uid()','public.neo_owner()');
 end loop;
end $$;
create function public.neo_protection(action text,secret text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); target uuid; key_value text; saved public.neo_recovery_keys; link public.neo_identity_links;
begin
 if v_actor is null then raise exception 'Sign in to Friends first.';end if;
 if action='recover' then
  -- A fresh authenticated identity only; never overwrite or merge an existing circle.
  perform pg_advisory_xact_lock(hashtextextended(v_actor::text,195));
  select * into link from public.neo_identity_links l where l.principal=v_actor;
  if found and link.active and link.owner<>v_actor then return jsonb_build_object('ok',true);end if;
  if found or exists(select 1 from public.neo_profiles where id=v_actor) or exists(select 1 from public.neo_cloud_backups where owner=v_actor) then raise exception 'Use a fresh Friends session to recover.';end if;
  if secret !~ '^CR1\.[a-f0-9]{64}$' then raise exception 'Check your private recovery key.';end if;
  select * into saved from public.neo_recovery_keys where key_hash=encode(extensions.digest(secret,'sha256'),'hex');
  if not found then raise exception 'Check your private recovery key.';end if;
  target:=saved.owner;
  perform pg_advisory_xact_lock(hashtextextended(target::text,195));
  select * into saved from public.neo_recovery_keys where owner=target and key_hash=encode(extensions.digest(secret,'sha256'),'hex') for update;
  if not found then raise exception 'This recovery key has already been used or replaced.';end if;
  insert into public.neo_identity_links values(target,target,false) on conflict(principal) do update set active=false;
  update public.neo_identity_links set active=false where owner=target;
  insert into public.neo_identity_links values(v_actor,target,true);
  delete from public.neo_recovery_keys where owner=target;
  insert into public.neo_identity_audit(owner,principal,action)values(target,v_actor,'recovered');
  return jsonb_build_object('ok',true);
 end if;
 target:=public.neo_owner();
 if not exists(select 1 from public.neo_profiles where id=target) then raise exception 'Join Friends first.';end if;
 if action='status' then return jsonb_build_object('protected',exists(select 1 from public.neo_recovery_keys where owner=target));end if;
 if action='issue' then
  key_value:='CR1.'||replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
  insert into public.neo_recovery_keys(owner,key_hash)values(target,encode(extensions.digest(key_value,'sha256'),'hex')) on conflict(owner)do update set key_hash=excluded.key_hash,created_at=now();
  insert into public.neo_identity_audit(owner,principal,action)values(target,v_actor,'key_replaced');
  return jsonb_build_object('key',key_value);
 end if;
 raise exception 'Unknown protection action.';
end $$;
revoke all on function public.neo_protection(text,text) from public,anon;
grant execute on function public.neo_protection(text,text) to authenticated;
-- Remember who placed a block; legacy blocks are not guessed or silently removed.
alter table public.neo_friends add column blocked_by uuid references public.neo_profiles(id);
create function public.neo_privacy(action text,peer uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=public.neo_owner();result jsonb;
begin
 if action='blocked' then
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.name)),'[]'::jsonb) into result from public.neo_friends f join public.neo_profiles p on p.id=case when f.sender=me then f.recipient else f.sender end where f.status='blocked' and f.blocked_by=me;return result;
 elsif action='unblock' then
  delete from public.neo_friends where status='blocked' and blocked_by=me and ((sender=me and recipient=peer)or(sender=peer and recipient=me));return jsonb_build_object('ok',true);
 end if;raise exception 'Unknown privacy action.';
end $$;
revoke all on function public.neo_privacy(text,uuid) from public,anon;
grant execute on function public.neo_privacy(text,uuid) to authenticated;
do $$ declare definition text;begin
 definition:=pg_get_functiondef('public.neo_social(text,jsonb)'::regprocedure);
 if position('set status=''blocked'' where' in definition)=0 then raise exception 'Unexpected block implementation';end if;
 execute replace(definition,'set status=''blocked'' where','set status=''blocked'',blocked_by=me where');
end $$;
commit;
