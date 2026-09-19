-- Support intake only: a case is NOT proof of ownership and never grants access.
begin;
create table public.neo_recovery_cases (
 id uuid primary key default gen_random_uuid(),
 claimant uuid not null references auth.users(id),
 old_code text not null default '' check(old_code ~ '^[A-Z0-9]{0,16}$'),
 status text not null default 'pending_review' check(status in ('pending_review','needs_evidence','verified_pending_action','declined','resolved')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.neo_recovery_audit (
 id bigint generated always as identity primary key,
 case_id uuid not null references public.neo_recovery_cases(id),
 actor text not null,
 from_status text,
 to_status text not null,
 evidence_reference text,
 created_at timestamptz not null default now()
);
alter table public.neo_recovery_cases enable row level security;
alter table public.neo_recovery_audit enable row level security;
revoke all on public.neo_recovery_cases,public.neo_recovery_audit from public,anon,authenticated;
create index neo_recovery_claimant_time on public.neo_recovery_cases(claimant,created_at);
create function public.neo_recovery_case(old_code text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); cid uuid;
begin
 if me is null then raise exception 'Sign in to Friends first.';end if;
 if old_code is null or old_code !~ '^[A-Z0-9]{0,16}$' then raise exception 'Check the friend code.';end if;
 perform pg_advisory_xact_lock(hashtextextended(me::text,93));
 select id into cid from public.neo_recovery_cases where claimant=me and status in ('pending_review','needs_evidence','verified_pending_action') order by created_at desc limit 1;
 if cid is null then
  if (select count(*) from public.neo_recovery_cases where claimant=me and created_at>now()-interval '1 day')>=3 then raise exception 'Please contact support with your existing reference.';end if;
  insert into public.neo_recovery_cases(claimant,old_code) values(me,old_code) returning id into cid;
  insert into public.neo_recovery_audit(case_id,actor,to_status) values(cid,me::text,'pending_review');
 end if;
 return jsonb_build_object('reference',cid,'status',(select status from public.neo_recovery_cases where id=cid));
end $$;
revoke all on function public.neo_recovery_case(text) from public,anon;
grant execute on function public.neo_recovery_case(text) to authenticated;
-- No browser/admin transfer endpoint is shipped. Verification and resolution
-- require a trusted store verifier plus an audited operator workflow first.
commit;
