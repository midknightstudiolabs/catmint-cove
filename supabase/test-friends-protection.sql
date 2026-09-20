-- Execute inside a transaction; caller must ROLLBACK after these fixtures.
insert into auth.users(id) values('20000000-0000-4000-8000-000000000001'),('20000000-0000-4000-8000-000000000002'),('20000000-0000-4000-8000-000000000003'),('20000000-0000-4000-8000-000000000004');
set local role authenticated;
do $$
declare a uuid:='20000000-0000-4000-8000-000000000001';b uuid:='20000000-0000-4000-8000-000000000002';c uuid:='20000000-0000-4000-8000-000000000003';d uuid:='20000000-0000-4000-8000-000000000004';code_a text;code_b text;k text;k2 text;denied boolean;
begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 code_a:=public.neo_social('join','{"name":"Recovery fixture"}')->>'code';
 perform public.neo_backup('save','CMC1.'||encode(convert_to('{"v":3,"cats":[]}','UTF8'),'base64'));
 k:=public.neo_protection('issue')->>'key';
 k2:=public.neo_protection('issue')->>'key';
 perform set_config('request.jwt.claim.sub',b::text,true);
 code_b:=public.neo_social('join','{"name":"Friend fixture"}')->>'code';
 perform public.neo_social('request',jsonb_build_object('code',code_a));
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.neo_social('accept',jsonb_build_object('id',b));
 perform set_config('request.jwt.claim.sub',c::text,true);
 denied:=false;begin perform public.neo_protection('recover',k);exception when others then denied:=true;end;
 if not denied then raise exception 'Replaced key accepted';end if;
 perform public.neo_protection('recover',k2);
 perform public.neo_protection('recover',k2); -- safe response retry on same authenticated device
 if public.neo_social('list')->'profile'->>'code'<>code_a then raise exception 'Code changed';end if;
 if jsonb_array_length(public.neo_social('list')->'friends')<>1 then raise exception 'Friends lost';end if;
 if jsonb_array_length(public.neo_backup('list'))<>1 then raise exception 'Backups lost';end if;
 if (public.neo_protection('status')->>'protected')::boolean then raise exception 'Used key not consumed';end if;
 perform public.neo_social('block',jsonb_build_object('id',b));
 if jsonb_array_length(public.neo_privacy('blocked'))<>1 then raise exception 'Own block missing';end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 perform public.neo_privacy('unblock',a);
 denied:=false;begin perform public.neo_social('request',jsonb_build_object('code',code_a));exception when others then denied:=true;end;
 if not denied then raise exception 'Peer removed someone elses block';end if;
 perform set_config('request.jwt.claim.sub',c::text,true);
 perform public.neo_privacy('unblock',b);
 if jsonb_array_length(public.neo_social('list')->'friends')<>0 then raise exception 'Unblock restored friendship without consent';end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 denied:=false;begin perform public.neo_social('list');exception when others then denied:=true;end;
 if not denied then raise exception 'Old device not revoked';end if;
 denied:=false;begin perform public.neo_backup('list');exception when others then denied:=true;end;
 if not denied then raise exception 'Old device sees backups';end if;
 perform set_config('request.jwt.claim.sub',d::text,true);
 denied:=false;begin perform public.neo_protection('recover',k2);exception when others then denied:=true;end;
 if not denied then raise exception 'Key replay accepted';end if;
end $$;
reset role;
