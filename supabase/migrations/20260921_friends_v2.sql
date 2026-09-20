-- Cove Friends v2: a friends-only cove card, gifts, hearts and cards.
-- Shells stay on each player's device. The server only meters (daily caps) and delivers; it never holds a balance.
-- Apply once, after 20260920_friends_protection.sql. Safe to re-run: functions are replaced, tables are created only if missing.
begin;

create table if not exists public.neo_cove_cards(
  owner uuid primary key references public.neo_profiles(id) on delete cascade,
  card jsonb not null check(pg_column_size(card)<=6000),
  updated_at timestamptz not null default now());

create table if not exists public.neo_gifts(
  id bigint generated always as identity primary key,
  sender uuid not null references public.neo_profiles(id) on delete cascade,
  recipient uuid not null references public.neo_profiles(id) on delete cascade,
  kind text not null check(kind in ('gift','love','card')),
  amount integer not null default 0 check(amount between 0 and 1000),
  text text check(text is null or char_length(text)<=60),
  style text check(style is null or style in ('sage','butter','sky','rose')),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  check(sender<>recipient));
create index if not exists neo_gifts_recipient_open on public.neo_gifts(recipient) where claimed_at is null;
create index if not exists neo_gifts_sender_day on public.neo_gifts(sender,created_at);
create index if not exists neo_gifts_recipient_day on public.neo_gifts(recipient,created_at);

alter table public.neo_cove_cards enable row level security;
alter table public.neo_gifts enable row level security;
revoke all on public.neo_cove_cards,public.neo_gifts from public,anon,authenticated;

create or replace function public.neo_friends2(action text,payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  me uuid:=public.neo_owner();
  d0 timestamptz:=date_trunc('day',now() at time zone 'utc') at time zone 'utc';
  peer uuid; amt integer; total integer; n integer; c jsonb; clean jsonb; q text; nm text; tg text; hits integer; hit_row public.neo_profiles; res jsonb;
  presets text[]:=array['Thinking of you','Lovely cove!','Your cats are the best','See you at the festival','Save me a sunny spot','Purrs from my cove'];
  decor_ids text[]:=array['flowerbox','chalkboard','parasol','lights','statue','fountain'];
begin
  if not exists(select 1 from public.neo_profiles where id=me) then raise exception 'Choose your Cove name first.';end if;

  if action='state' then
    return jsonb_build_object(
      'me',(select jsonb_build_object('code',p.code,'name',p.name,'tag',right(p.code,4)) from public.neo_profiles p where p.id=me),
      'friends',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'tag',right(p.code,4),'since',(extract(epoch from f.created_at)*1000)::bigint,'card',cc.card) order by p.name)
        from public.neo_friends f join public.neo_profiles p on p.id=case when f.sender=me then f.recipient else f.sender end
        left join public.neo_cove_cards cc on cc.owner=p.id where (f.sender=me or f.recipient=me) and f.status='accepted'),'[]'::jsonb),
      'requests',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'tag',right(p.code,4)) order by f.created_at)
        from public.neo_friends f join public.neo_profiles p on p.id=f.sender where f.recipient=me and f.status='pending'),'[]'::jsonb),
      'pending',coalesce((select jsonb_agg(f.recipient) from public.neo_friends f where f.sender=me and f.status='pending'),'[]'::jsonb),
      'inbox',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'type',case when g.kind='card' then 'card' else 'gift' end,'kind',g.kind,'from',g.sender,'fromName',p.name,'amount',g.amount,'text',g.text,'style',g.style,'at',(extract(epoch from g.created_at)*1000)::bigint) order by g.created_at desc)
        from (select * from public.neo_gifts where recipient=me and claimed_at is null order by created_at desc limit 100) g join public.neo_profiles p on p.id=g.sender),'[]'::jsonb),
      'sent',(select coalesce(sum(amount),0) from public.neo_gifts where sender=me and kind='gift' and created_at>=d0),
      'loveSent',(select count(*) from public.neo_gifts where sender=me and kind='love' and created_at>=d0),
      'received',coalesce((select jsonb_object_agg(recipient::text,s) from (select recipient,sum(amount) s from public.neo_gifts where sender=me and kind in ('gift','love') and created_at>=d0 group by recipient) x),'{}'::jsonb),
      'cardsSent',coalesce((select jsonb_object_agg(recipient::text,true) from (select distinct recipient from public.neo_gifts where sender=me and kind='card' and created_at>=d0) x),'{}'::jsonb));

  elsif action='find' then
    perform pg_advisory_xact_lock(hashtextextended(me::text,194));
    if (select count(*) from public.neo_friend_actions where owner=me and kind='preview' and created_at>now()-interval '1 day')>=30 then raise exception 'Try more searches tomorrow.';end if;
    insert into public.neo_friend_actions(owner,kind)values(me,'preview');
    q:=trim(coalesce(payload->>'q',''));
    if position('#' in q)>0 then
      nm:=upper(regexp_replace(split_part(q,'#',1),'[^a-zA-Z0-9]','','g'));tg:=upper(regexp_replace(split_part(q,'#',2),'[^a-zA-Z0-9]','','g'));
      if char_length(nm)<2 or char_length(tg)<>4 then raise exception 'Enter a name and a 4-character tag, like Lark#4821.';end if;
      select count(*) into hits from public.neo_profiles p where p.id<>me and right(p.code,4)=tg and (upper(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=nm or upper(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=nm||'SCOVE' or upper(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=nm||'COVE');
      if hits>1 then raise exception 'More than one cove matches. Use their friend code.';end if;
      select * into hit_row from public.neo_profiles p where p.id<>me and right(p.code,4)=tg and (upper(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=nm or upper(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=nm||'SCOVE' or upper(regexp_replace(p.name,'[^a-zA-Z0-9]','','g'))=nm||'COVE');
    else
      tg:=upper(regexp_replace(q,'[^a-zA-Z0-9]','','g'));
      if char_length(tg)<8 then raise exception 'Enter a friend code, or a name and tag like Lark#4821.';end if;
      select * into hit_row from public.neo_profiles p where p.code=tg and p.id<>me;
    end if;
    if hit_row.id is null then raise exception 'No Cove found. Check the code, or try the name and tag together (like Lark#4821).';end if;
    if exists(select 1 from public.neo_friends f where (f.sender=me and f.recipient=hit_row.id) or (f.sender=hit_row.id and f.recipient=me)) then raise exception 'This invitation is unavailable or already in your list.';end if;
    return jsonb_build_object('name',hit_row.name,'code',hit_row.code,'tag',right(hit_row.code,4));

  elsif action='publish_card' then
    c:=payload->'card';
    if c is null or jsonb_typeof(c)<>'object' then raise exception 'Nothing to share.';end if;
    if exists(select 1 from public.neo_cove_cards where owner=me and updated_at>now()-interval '10 seconds') then return jsonb_build_object('ok',true,'skipped',true);end if;
    clean:=jsonb_build_object(
      'cats',coalesce((select jsonb_agg(jsonb_build_object('name',left(coalesce(x->>'name','Cat'),24),'coatKey',left(regexp_replace(coalesce(x->>'coatKey',''),'[^a-zA-Z0-9_-]','','g'),24),'star',least(greatest(coalesce((x->>'star')::integer,2),0),5),'markSeed',trunc(coalesce((x->>'markSeed')::numeric,0)),
          'worn',coalesce((select jsonb_agg(ww.w) from (select left(e.value,24) w from jsonb_array_elements_text(case when jsonb_typeof(x->'worn')='array' then x->'worn' else '[]'::jsonb end) e limit 6) ww),'[]'::jsonb)))
        from (select e.value x from jsonb_array_elements(case when jsonb_typeof(c->'cats')='array' then c->'cats' else '[]'::jsonb end) e limit 8) cs),'[]'::jsonb),
      'team',coalesce((select jsonb_agg(t.v) from (select least(greatest(e.value::integer,0),7) v from jsonb_array_elements_text(case when jsonb_typeof(c->'team')='array' then c->'team' else '[]'::jsonb end) e limit 5) t),'[]'::jsonb),
      'guardian',least(greatest(coalesce((c->>'guardian')::integer,0),0),7),
      'theme',left(regexp_replace(coalesce(c->>'theme','default'),'[^a-zA-Z]','','g'),12));
    if jsonb_typeof(c->'cafe')='object' then
      clean:=clean||jsonb_build_object('cafe',jsonb_build_object(
        'name',left(coalesce(c->'cafe'->>'name',''),40),
        'shopTier',least(greatest(coalesce((c->'cafe'->>'shopTier')::integer,0),0),2),
        'finish',left(regexp_replace(coalesce(c->'cafe'->>'finish','sage'),'[^a-zA-Z]','','g'),12),
        'speed',least(greatest(coalesce((c->'cafe'->>'speed')::integer,0),0),2),
        'seats',least(greatest(coalesce((c->'cafe'->>'seats')::integer,0),0),5),
        'cookware',coalesce((c->'cafe'->>'cookware')::boolean,false),
        'decor',coalesce((select jsonb_object_agg(k,true) from jsonb_object_keys(case when jsonb_typeof(c->'cafe'->'decor')='object' then c->'cafe'->'decor' else '{}'::jsonb end) k where k=any(decor_ids) and coalesce((c->'cafe'->'decor'->>k)::boolean,false)),'{}'::jsonb),
        'served',least(greatest(coalesce((c->'cafe'->>'served')::bigint,0),0),1000000000),
        'rating',case when jsonb_typeof(c->'cafe'->'rating')='number' then to_jsonb(least(greatest(round((c->'cafe'->>'rating')::numeric,1),0),5)) else null end,
        'menu',coalesce((select jsonb_agg(mm.m) from (select left(regexp_replace(e.value,'[^a-zA-Z]','','g'),16) m from jsonb_array_elements_text(case when jsonb_typeof(c->'cafe'->'menu')='array' then c->'cafe'->'menu' else '[]'::jsonb end) e limit 6) mm),'[]'::jsonb)));
    end if;
    insert into public.neo_cove_cards(owner,card)values(me,clean) on conflict(owner) do update set card=excluded.card,updated_at=now();

  elsif action in ('gift','love','card') then
    peer:=(payload->>'id')::uuid;
    if not exists(select 1 from public.neo_friends f where f.status='accepted' and ((f.sender=me and f.recipient=peer) or (f.sender=peer and f.recipient=me))) then raise exception 'Accept the invitation first.';end if;
    perform pg_advisory_xact_lock(hashtextextended(me::text,196));
    if action='card' then
      if not coalesce((payload->>'text')=any(presets),false) then raise exception 'Pick one of the card messages.';end if;
      if not coalesce((payload->>'style')=any(array['sage','butter','sky','rose']),false) then raise exception 'Pick one of the card colours.';end if;
      if exists(select 1 from public.neo_gifts where sender=me and recipient=peer and kind='card' and created_at>=d0) then raise exception 'You left this friend a card today. Another tomorrow.';end if;
      insert into public.neo_gifts(sender,recipient,kind,text,style)values(me,peer,'card',payload->>'text',payload->>'style');
    else
      if action='gift' then
        amt:=(payload->>'amount')::integer;
        if amt is null or amt not in (50,100,250,500,1000) then raise exception 'Choose one of the gift sizes.';end if;
        select coalesce(sum(amount),0) into total from public.neo_gifts where sender=me and kind='gift' and created_at>=d0;
        if total+amt>1000 then raise exception 'You can send up to 1,000 Shells a day. % left today.',greatest(0,1000-total);end if;
      else
        amt:=10;
        select count(*) into n from public.neo_gifts where sender=me and kind='love' and created_at>=d0;
        if n>=3 then raise exception 'You have sent 3 hearts today. More tomorrow.';end if;
      end if;
      perform pg_advisory_xact_lock(hashtextextended(peer::text,197));
      select coalesce(sum(amount),0) into total from public.neo_gifts where recipient=peer and kind in ('gift','love') and created_at>=d0;
      if total+amt>2000 then raise exception 'This friend has received a lot today. Try again tomorrow.';end if;
      insert into public.neo_gifts(sender,recipient,kind,amount)values(me,peer,action,amt);
    end if;

  elsif action='claim' then
    with got as (update public.neo_gifts set claimed_at=now() where recipient=me and claimed_at is null returning id,sender,kind,amount,text,style,created_at)
    select jsonb_build_object('shells',coalesce(sum(g.amount) filter (where g.kind in ('gift','love')),0),
      'cards',coalesce(jsonb_agg(jsonb_build_object('id',g.id,'fromName',p.name,'text',g.text,'style',g.style,'at',(extract(epoch from g.created_at)*1000)::bigint) order by g.created_at desc) filter (where g.kind='card'),'[]'::jsonb))
      into res from got g join public.neo_profiles p on p.id=g.sender;
    return coalesce(res,jsonb_build_object('shells',0,'cards','[]'::jsonb));

  else raise exception 'Unknown action.';end if;
  return jsonb_build_object('ok',true);
end $$;
revoke all on function public.neo_friends2(text,jsonb) from public,anon;
grant execute on function public.neo_friends2(text,jsonb) to authenticated;
commit;
