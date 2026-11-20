-- Fixtures and temporary sessions exist only inside this rolled-back transaction.
begin;
do $$
declare admin_user uuid; ordinary_user uuid; sid uuid:=gen_random_uuid(); oid uuid:=gen_random_uuid(); result jsonb; payload jsonb; gid uuid; rejected bool;
begin
 select auth_user_id into admin_user from public.players where is_admin and registration_completed limit 1;
 select auth_user_id into ordinary_user from public.players where not is_admin and registration_completed limit 1;
 if admin_user is null or ordinary_user is null then raise exception 'Admin and ordinary test identities required'; end if;
 insert into auth.sessions(id,user_id) values(sid,admin_user),(oid,ordinary_user);
 insert into public.games(city_name,city_lat,city_lng,status,finished_at,created_at) values('Rolled back random-placement fixture',47.2,18.6,'finished',now(),now()+interval '1 day');
 payload:=jsonb_build_object('city','Test fixture','lat',47.2,'lng',18.6,'mordor',jsonb_build_array(47.201,18.601),'safe',true,'points',(select jsonb_agg(jsonb_build_array(47.2+(i*0.0001),18.6)) from generate_series(0,25) i),'route',jsonb_build_array(jsonb_build_array(47.2,18.6),jsonb_build_array(47.201,18.601)),'gem_count',20);
 result:=public.game_action(admin_user,'create',payload,sid);gid:=(result->'game'->>'id')::uuid;
 if (select count(*) from public.items where game_id=gid and item_type='ring')<>6 or (select count(*) from public.items where game_id=gid and item_type='gem')<>20 then raise exception 'Incorrect generated item count';end if;
 if (select count(distinct (latitude,longitude)) from public.items where game_id=gid)<>26 then raise exception 'Generated locations collapsed';end if;
 result:=public.game_action(admin_user,'create',payload-'gem_count',sid);gid:=(result->'game'->>'id')::uuid;
 if (select count(*) from public.items where game_id=gid and item_type='gem')<>40 then raise exception 'Legacy default changed';end if;
 rejected:=false;begin perform public.game_action(admin_user,'create',jsonb_set(payload,'{gem_count}','21'),sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Invalid gem count accepted';end if;
 rejected:=false;begin perform public.game_action(ordinary_user,'create',payload,oid);exception when others then rejected:=true;end;if not rejected then raise exception 'Non-admin create accepted';end if;
 rejected:=false;begin perform public.game_action(admin_user,'create',payload-'safe',sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Missing safety accepted';end if;
end $$;
select 'PASS: 6 rings + 20 gems at 26 locations; legacy 40; invalid count, non-admin and missing safety rejected; transaction rolled back' as result;
rollback;
