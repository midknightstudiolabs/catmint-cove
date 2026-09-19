-- Private evidence ledger. Events never grant ownership or authorize recovery.
begin;
create table public.neo_purchase_events (
 event_id text primary key check(length(event_id) between 1 and 200),
 app_id text not null,
 environment text not null check(environment in ('SANDBOX','PRODUCTION')),
 event_type text not null,
 app_user_id text,
 original_app_user_id text,
 product_id text,
 store text,
 transaction_id text,
 original_transaction_id text,
 event_timestamp_ms bigint not null,
 received_at timestamptz not null default now(),
 -- Preserve aliases/transfers for manual evidence review, not identity proof.
 related_ids jsonb not null default '{}'::jsonb
);
alter table public.neo_purchase_events enable row level security;
revoke all on public.neo_purchase_events from public,anon,authenticated;
grant select,insert on public.neo_purchase_events to service_role;
create index neo_purchase_customer on public.neo_purchase_events(app_user_id,event_timestamp_ms desc);
create index neo_purchase_transaction on public.neo_purchase_events(original_transaction_id,environment);
commit;
