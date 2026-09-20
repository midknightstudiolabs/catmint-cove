-- Aggregate reporting only; no account IDs, names, saves or purchase receipts.
begin;
create or replace function public.neo_studio_report(days integer default 28)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare result jsonb;
begin
  if days not in (7,28,56) then raise exception 'Unsupported period'; end if;
  select jsonb_build_object('generatedAt',now(),'days',days,'source','Supabase · neo_events',
    'events',count(*),'participants',count(distinct owner),'latestEvent',max(created_at),
    'features',coalesce((select jsonb_agg(x) from (
      select event,count(*) as events,count(distinct owner) as participants
      from public.neo_events where created_at>=now()-make_interval(days=>days)
      group by event order by event) x),'[]'::jsonb)
  ) into result from public.neo_events where created_at>=now()-make_interval(days=>days);
  return result;
end $$;
revoke all on function public.neo_studio_report(integer) from public,anon,authenticated;
grant execute on function public.neo_studio_report(integer) to service_role;
commit;

begin;
create table if not exists public.neo_product_events (
 owner uuid not null references auth.users(id) on delete cascade,
 id uuid not null, event text not null, entity text not null default '', category text not null default '',
 platform text not null, release text not null, channel text not null, round uuid,
 shells integer not null default 0, pearls integer not null default 0,
 occurred_at timestamptz not null, created_at timestamptz not null default now(), primary key(owner,id));
alter table public.neo_product_events enable row level security;
revoke all on public.neo_product_events from anon,authenticated;
create index if not exists neo_product_time on public.neo_product_events(occurred_at);
create index if not exists neo_product_rate on public.neo_product_events(owner,created_at);
create unique index if not exists neo_product_round on public.neo_product_events(owner,event,round) where round is not null;
create or replace function public.neo_product_ingest(batch jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); x jsonb; n integer:=0;
begin
 if uid is null then raise exception 'Sign in required'; end if;
 if jsonb_typeof(batch)<>'array' or jsonb_array_length(batch)>40 then raise exception 'Invalid batch'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if (select count(*) from neo_product_events where owner=uid and created_at>now()-interval '1 hour')+jsonb_array_length(batch)>1000 then raise exception 'Rate limit'; end if;
 for x in select value from jsonb_array_elements(batch) loop
 if coalesce(x->>'event','') not in ('session_started','item_purchased','activity_started','activity_completed','menu_opened') or coalesce(x->>'platform','') not in ('iOS','Android','Web') or coalesce(x->>'channel','') not in ('neo','native') or length(coalesce(x->>'entity',''))>60 or length(coalesce(x->>'release',''))>40 or coalesce(x->>'category','') not in ('','accessories','comforts','stations','decor','upgrades') then raise exception 'Invalid event'; end if;
 if coalesce((x->>'shells')::integer,0) not between 0 and 10000000 or coalesce((x->>'pearls')::integer,0) not between 0 and 100000 then raise exception 'Invalid amount'; end if;
 if x->>'event' in ('activity_started','activity_completed') and nullif(x->>'round','') is null then raise exception 'Round required'; end if;
 insert into neo_product_events(owner,id,event,entity,category,platform,release,channel,round,shells,pearls,occurred_at)
 values(uid,(x->>'id')::uuid,x->>'event',coalesce(x->>'entity',''),coalesce(x->>'category',''),x->>'platform',coalesce(x->>'release',''),x->>'channel',nullif(x->>'round','')::uuid,coalesce((x->>'shells')::integer,0),coalesce((x->>'pearls')::integer,0),greatest(now()-interval '7 days',least(now(),coalesce((x->>'at')::timestamptz,now())))) on conflict do nothing;
 n:=n+1;
 end loop;
 return jsonb_build_object('accepted',n);
end $$;
revoke all on function public.neo_product_ingest(jsonb) from public,anon;
grant execute on function public.neo_product_ingest(jsonb) to authenticated;
create or replace function public.neo_studio_product_report(days integer default 28, platform_filter text default 'all', channel_filter text default 'neo') returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
 if days not in (7,28,56) or platform_filter not in ('all','iOS','Android','Web') or channel_filter not in ('all','neo','native') then raise exception 'Invalid filter'; end if;
 with e as (select * from neo_product_events where occurred_at>=now()-make_interval(days=>days) and (platform_filter='all' or platform=platform_filter) and (channel_filter='all' or channel=channel_filter)),
 purchases as (select category,entity,count(*) copies,count(distinct owner) buyers,sum(shells) shells,sum(pearls) pearls from e where event='item_purchased' group by category,entity order by buyers desc,copies desc),
 rounds as (select s.entity,s.owner,s.round,exists(select 1 from neo_product_events c where c.owner=s.owner and c.round=s.round and c.event='activity_completed' and c.entity=s.entity) finished from e s where event='activity_started'),
 games as (select entity,count(*) starts,count(*) filter(where finished) completed,count(distinct owner) players from rounds group by entity),
 menus as (select entity,count(*) opens,count(distinct owner) players from e where event='menu_opened' group by entity order by players desc),
 daily as (select (occurred_at at time zone 'UTC')::date as day,count(distinct owner) players,count(*) filter(where event='item_purchased') purchases,count(*) filter(where event='activity_started') rounds from e group by 1 order by 1)
 select jsonb_build_object('generatedAt',now(),'days',days,'events',count(*),'participants',count(distinct owner),'latestEvent',max(occurred_at),'purchases',coalesce((select jsonb_agg(purchases) from purchases),'[]'::jsonb),'games',coalesce((select jsonb_agg(games) from games),'[]'::jsonb),'menus',coalesce((select jsonb_agg(menus) from menus),'[]'::jsonb),'daily',coalesce((select jsonb_agg(daily) from daily),'[]'::jsonb),'friends',public.neo_studio_report(days)) into result from e;
 return result;
end $$;
revoke all on function public.neo_studio_product_report(integer,text,text) from public,anon,authenticated;
grant execute on function public.neo_studio_product_report(integer,text,text) to service_role;
commit;
