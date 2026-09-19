-- Runs real permissions/functions with a temporary user; always roll back.
begin;
with u as (insert into auth.users(id) values(gen_random_uuid()) returning id)
select set_config('neo_test.owner',id::text,true) from u;
select set_config('request.jwt.claim.sub',current_setting('neo_test.owner'),true);
set local role authenticated;
do $$
declare saved jsonb; readback jsonb; denied boolean:=false;
begin
 saved:=public.neo_backup('save','CMC1.'||encode(convert_to('{"v":3,"cats":[]}','UTF8'),'base64'));
 if jsonb_array_length(public.neo_backup('list'))<>1 then raise exception 'Owner list failed';end if;
 readback:=public.neo_backup('read','',(saved->>'id')::uuid);
 if readback->>'code' not like 'CMC1.%' then raise exception 'Owner read failed';end if;
 if public.neo_backup('save',readback->>'code')->>'id'<>saved->>'id' then raise exception 'Duplicate backup failed';end if;
 begin perform public.neo_backup('save','CMC1.invalid');exception when others then denied:=true;end;
 if not denied then raise exception 'Invalid backup accepted';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 if jsonb_array_length(public.neo_backup('list'))<>0 then raise exception 'Cross-user list leaked';end if;
 denied:=false;
 begin perform public.neo_backup('read','',(saved->>'id')::uuid);exception when others then denied:=true;end;
 if not denied then raise exception 'Cross-user read leaked';end if;
 perform set_config('request.jwt.claim.sub','',true);
 denied:=false;
 begin perform public.neo_backup('list');exception when others then denied:=true;end;
 if not denied then raise exception 'Unauthenticated request accepted';end if;
end $$;
reset role;
rollback;
select 'Backup permission tests passed; temporary user and data rolled back' as result;
