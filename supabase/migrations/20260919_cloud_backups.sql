-- Opt-in, owner-only versioned saves. A backup never proves purchase ownership.
begin;
create table public.neo_cloud_backups (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references auth.users(id) on delete cascade,
 save_code text not null check(length(save_code) between 10 and 1400000),
 created_at timestamptz not null default now()
);
alter table public.neo_cloud_backups enable row level security;
revoke all on public.neo_cloud_backups from public,anon,authenticated;
create index neo_cloud_backup_owner on public.neo_cloud_backups(owner,created_at desc);
create function public.neo_backup(action text, code text default '', backup_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); result jsonb; latest public.neo_cloud_backups; decoded jsonb;
begin
 if me is null then raise exception 'Sign in to Friends first.'; end if;
 if action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'created_at',b.created_at) order by b.created_at desc),'[]'::jsonb) into result from public.neo_cloud_backups b where owner=me;
  return result;
 elsif action='read' then
  select jsonb_build_object('id',id,'code',save_code,'created_at',created_at) into result from public.neo_cloud_backups where id=backup_id and owner=me;
  if result is null then raise exception 'Backup not found.'; end if;
  return result;
 elsif action='save' then
  if code is null or length(code)>1400000 or code not like 'CMC1.%' then raise exception 'Invalid backup.'; end if;
  begin decoded:=convert_from(decode(substr(code,6),'base64'),'UTF8')::jsonb;
  exception when others then raise exception 'Invalid backup.'; end;
  if jsonb_typeof(decoded) is distinct from 'object' or not decoded ? 'v' or jsonb_typeof(decoded->'cats') is distinct from 'array' then raise exception 'Invalid Cove save.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(me::text,94));
  select * into latest from public.neo_cloud_backups where owner=me order by created_at desc limit 1;
  if latest.save_code=code then return jsonb_build_object('id',latest.id,'created_at',latest.created_at);end if;
  if latest.created_at>now()-interval '5 minutes' then raise exception 'Your recent backup is safe. Try again in a few minutes.';end if;
  insert into public.neo_cloud_backups(owner,save_code) values(me,code) returning jsonb_build_object('id',id,'created_at',created_at) into result;
  delete from public.neo_cloud_backups where owner=me and id not in (select id from public.neo_cloud_backups where owner=me order by created_at desc limit 5);
  return result;
 end if;
 raise exception 'Unknown backup action.';
end $$;
revoke all on function public.neo_backup(text,text,uuid) from public,anon;
grant execute on function public.neo_backup(text,text,uuid) to authenticated;
commit;
