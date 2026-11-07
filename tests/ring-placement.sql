begin;
do $$
declare uid uuid:=gen_random_uuid(); sid uuid:=gen_random_uuid(); pid uuid; gid uuid; iid uuid; result jsonb; rejected bool;
begin
 insert into auth.users(id,email) values(uid,uid||'@test.invalid');
 insert into auth.sessions(id,user_id) values(sid,uid);
 pid:=public.game_register_open('RingPlacementTest','12345678',uid,'{}');
 insert into public.games(city_name,city_lat,city_lng,config) values('Placement fixture',50,14,'{"points":[[50,14],[50,14],[50,14],[50,14],[50,14],[50,14]],"route":[[50,14],[50.01,14]]}') returning id into gid;
 insert into public.items(game_id,item_type,item_name,latitude,longitude) values(gid,'ring','Anor Arany Fénye',50,14) returning id into iid;
 rejected:=false;begin perform public.game_action(uid,'place_ring',jsonb_build_object('item',iid,'lat',50.001,'lng',14.001,'safe',true),sid);exception when others then rejected:=true;end;
 if not rejected then raise exception 'Ordinary player could move a ring'; end if;
 update public.players set is_admin=true where id=pid;
 result:=public.game_action(uid,'place_ring',jsonb_build_object('item',iid,'lat',50.001,'lng',14.001,'safe',true),sid);
 if not exists(select 1 from public.items where id=iid and latitude=50.001 and longitude=14.001 and status='ground') then raise exception 'Placement was not saved'; end if;
 if not exists(select 1 from public.game_events where game_id=gid and event_type='place_ring') then raise exception 'Missing audit event'; end if;
 if (select config->'points'->0 from public.games where id=gid)<>'[50.001,14.001]'::jsonb then raise exception 'Blueprint not updated'; end if;
 rejected:=false;begin perform public.game_action(uid,'place_ring',jsonb_build_object('item',iid,'lat',51,'lng',14,'safe',true),sid);exception when others then rejected:=true;end;
 if not rejected then raise exception 'Remote placement accepted'; end if;
 rejected:=false;begin perform public.game_action(uid,'place_ring',jsonb_build_object('item',iid,'lat',50,'lng',14),sid);exception when others then rejected:=true;end;
 if not rejected then raise exception 'Missing safety confirmation accepted'; end if;
 update public.items set status='owned',owner_id=pid where id=iid;
 rejected:=false;begin perform public.game_action(uid,'place_ring',jsonb_build_object('item',iid,'lat',50,'lng',14,'safe',true),sid);exception when others then rejected:=true;end;
 if not rejected then raise exception 'Owned ring could be moved'; end if;
end $$;
select 'PASS: admin-only placement, saved coordinates, audit, blueprint, distance, safety, owned-ring protection' as result;
rollback;
