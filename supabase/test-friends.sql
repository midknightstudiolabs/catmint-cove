-- Three disposable identities, real RPC permissions, no persistent changes.
begin;
insert into auth.users(id) values
 ('10000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002'),
 ('10000000-0000-4000-8000-000000000003');
set local role authenticated;
do $$
declare
 a uuid := '10000000-0000-4000-8000-000000000001';
 b uuid := '10000000-0000-4000-8000-000000000002';
 outsider uuid := '10000000-0000-4000-8000-000000000003';
 code_b text; code_outsider text; result jsonb; denied boolean;
begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.neo_social('join','{"name":"Friends test A"}');
 perform set_config('request.jwt.claim.sub',b::text,true);
 code_b := public.neo_social('join','{"name":"Friends test B"}')->>'code';
 perform public.neo_social('publish','{"picture":"data:image/webp;base64,UklGRg=="}');
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 code_outsider := public.neo_social('join','{"name":"Friends test outsider"}')->>'code';
 denied := false;
 begin perform public.neo_social('visit',jsonb_build_object('id',b)); exception when others then denied := true; end;
 if not denied then raise exception 'Unrelated account can visit'; end if;
 denied := false;
 begin perform 1 from public.neo_snapshots; exception when insufficient_privilege then denied := true; end;
 if not denied then raise exception 'Direct snapshot access allowed'; end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 if public.neo_social('preview',jsonb_build_object('code',code_b))->>'name' <> 'Friends test B' then raise exception 'Name preview failed'; end if;
 perform public.neo_social('request',jsonb_build_object('code',code_b));
 denied := false;
 begin perform public.neo_social('visit',jsonb_build_object('id',b)); exception when others then denied := true; end;
 if not denied then raise exception 'Pending invite can visit'; end if;
 denied := false;
 begin perform public.neo_social('accept',jsonb_build_object('id',b)); exception when others then denied := true; end;
 if not denied then raise exception 'Sender can accept own invite'; end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 perform public.neo_social('accept',jsonb_build_object('id',a));
 perform set_config('request.jwt.claim.sub',a::text,true);
 result := public.neo_social('visit',jsonb_build_object('id',b));
 if result->>'name' <> 'Friends test B' then raise exception 'Accepted visit failed'; end if;
 perform public.neo_social('hello',jsonb_build_object('id',b));
 perform public.neo_social('hello',jsonb_build_object('id',b));
 perform set_config('request.jwt.claim.sub',b::text,true);
 if (public.neo_social('list')->>'hellos')::int <> 1 then raise exception 'Duplicate greeting counted'; end if;
 perform public.neo_social('unpublish');
 perform set_config('request.jwt.claim.sub',a::text,true);
 denied := false;
 begin perform public.neo_social('visit',jsonb_build_object('id',b)); exception when others then denied := true; end;
 if not denied then raise exception 'Unpublished picture visible'; end if;
 perform public.neo_social('block',jsonb_build_object('id',b));
 perform set_config('request.jwt.claim.sub',b::text,true);
 denied := false;
 begin perform public.neo_social('hello',jsonb_build_object('id',a)); exception when others then denied := true; end;
 if not denied then raise exception 'Blocked greeting allowed'; end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 for i in 1..9 loop
  perform public.neo_social('request',jsonb_build_object('code',code_outsider));
  perform public.neo_social('remove',jsonb_build_object('id',outsider));
 end loop;
 denied := false;
 begin perform public.neo_social('request',jsonb_build_object('code',code_outsider)); exception when others then
  if sqlerrm <> 'Try more invitations tomorrow.' then raise; end if; denied := true;
 end;
 if not denied then raise exception 'Removing invitations bypasses daily limit'; end if;
 perform set_config('request.jwt.claim.sub','',true);
 denied := false;
 begin perform public.neo_social('list'); exception when others then denied := true; end;
 if not denied then raise exception 'Missing identity allowed'; end if;
end $$;
reset role;
rollback;
select 'PASS: preview, invitation, acceptance, visit, greeting deduplication, unpublish, block, durable rate limit, outsider and direct-table isolation. Fixtures rolled back.' as result;
