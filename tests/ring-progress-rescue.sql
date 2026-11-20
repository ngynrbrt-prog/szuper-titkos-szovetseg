-- All test identities/sessions, game changes, locations and traces are rolled back.
begin;
do $$
declare uid uuid; other_uid uuid; pid uuid; other_pid uuid; sid uuid:=gen_random_uuid(); other_sid uuid:=gen_random_uuid(); gid uuid; ids uuid[]; result jsonb; rejected bool; old_color smallint; free_color int; expected int; map_color int;
begin
 select auth_user_id,id,color_id into uid,pid,old_color from public.players where is_admin and registration_completed limit 1;
 select auth_user_id,id into other_uid,other_pid from public.players where not is_admin and registration_completed limit 1;
 if uid is null or other_uid is null then raise exception 'Two registered test identities required';end if;
 insert into auth.sessions(id,user_id) values(sid,uid),(other_sid,other_uid);
 insert into public.games(city_name,city_lat,city_lng,status,started_at,created_at,mordor_lat,mordor_lng,sauron_cooldown_until,config)
 values('Rollback rules fixture',47.2,18.6,'active',now()-interval '2 hours',now()+interval '1 day',47.2,18.6,now()+interval '1 hour','{"route":[[47.2,18.6],[47.201,18.601]],"sauron_position":[47.2,18.6]}') returning id into gid;
 insert into public.game_results(game_id,player_id) select gid,id from public.players;
 insert into public.player_locations(player_id,game_id,latitude,longitude,accuracy_m,sharing_enabled,updated_at,immune_until)
 select id,gid,47.2,18.6,5,true,now()-interval '20 seconds',now()+interval '1 day' from public.players where registration_completed
 on conflict(player_id) do update set game_id=excluded.game_id,latitude=excluded.latitude,longitude=excluded.longitude,accuracy_m=5,sharing_enabled=true,updated_at=excluded.updated_at,immune_until=excluded.immune_until;
 insert into public.items(game_id,item_type,item_name,latitude,longitude,owner_id,status,collected_at)
 select gid,'ring','Fixture ring '||i,47.2,18.6,pid,'owned',now()-interval '2 hours' from generate_series(1,6) i;
 select array_agg(id order by item_name) into ids from public.items where game_id=gid;
 update public.items set collected_at=now()-interval '5 seconds' where id=ids[1];
 result:=public.game_action(uid,'location','{"lat":47.2,"lng":18.6,"accuracy":5}',sid);
 if (select ring_share_seconds from public.items where id=ids[1])<>5 or (select ring_share_seconds from public.items where id=ids[2])<>20 then raise exception 'Per-ring possession boundary failed';end if;
 if not exists(select 1 from game_private.location_samples where game_id=gid and player_id=pid) then raise exception 'Missing shared trail sample';end if;
 update public.player_locations set updated_at=now()-interval '45 seconds' where player_id=pid;
 result:=public.game_action(uid,'location','{"lat":47.2,"lng":18.6,"accuracy":5}',sid);
 if (select ring_share_seconds from public.items where id=ids[2])<>20 then raise exception 'Stale GPS earned time';end if;
 select count(distinct segment_id) into expected from game_private.location_samples where game_id=gid and player_id=pid;
 perform public.game_action(uid,'stop','{}',sid);
 update game_private.location_samples set sampled_at=now()-interval '31 seconds' where game_id=gid and player_id=pid;
 perform public.game_action(uid,'location','{"lat":47.2,"lng":18.6,"accuracy":5}',sid);
 if (select count(distinct segment_id) from game_private.location_samples where game_id=gid and player_id=pid)<>expected+1 then raise exception 'Sharing restart did not break trail';end if;
 update public.items set ring_share_seconds=3599 where id=ids[1];
 rejected:=false;begin perform public.game_action(uid,'destroy',jsonb_build_object('item',ids[1]),sid);exception when others then rejected:=true;end;if not rejected then raise exception '3599 seconds could destroy';end if;
 update public.items set ring_share_seconds=3600 where id=ids[1];
 result:=public.game_action(uid,'destroy',jsonb_build_object('item',ids[1]),sid);
 if result->'game'->>'status'<>'active' then raise exception 'First ring ended game';end if;
 rejected:=false;begin perform public.game_action(uid,'finish','{}',sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Admin could finish active game early';end if;
 rejected:=false;begin perform public.game_action(uid,'destroy_all','{}',sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Destroy all accepted under-aged ring';end if;
 update public.items set ring_share_seconds=3600 where game_id=gid and status='owned';
 perform public.game_action(other_uid,'rob',jsonb_build_object('item',ids[2]),other_sid);
 if not exists(select 1 from public.items where id=ids[2] and owner_id=other_pid and ring_share_seconds=0) then raise exception 'Robbery retained previous owner progress';end if;
 update public.items set owner_id=pid,ring_share_seconds=3600 where game_id=gid and status='owned';
 result:=public.game_action(uid,'destroy_all','{}',sid);
 if result->'game'->>'status'<>'finished' or result->'game'->'config'->>'finish_reason'<>'all_rings_destroyed' then raise exception 'Six rings did not finish';end if;
 if jsonb_array_length(result->'last_round'->'map'->'tracks')<1 then raise exception 'Summary lacks trails';end if;
 select (x->>'color_id')::int into map_color from jsonb_array_elements(result->'last_round'->'map'->'players') x where x->>'id'=pid::text;
 select c into free_color from generate_series(1,8)c where not exists(select 1 from public.players where color_id=c) limit 1;
 result:=public.game_action(uid,'color',jsonb_build_object('color_id',free_color),sid);
 if not exists(select 1 from jsonb_array_elements(result->'last_round'->'map'->'players')x where x->>'id'=pid::text and (x->>'color_id')::int=map_color) then raise exception 'Old round color snapshot changed';end if;
 rejected:=false;begin perform public.game_action(other_uid,'color',jsonb_build_object('color_id',free_color),other_sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Duplicate player color accepted';end if;
 -- Reuse this uncommitted fixture for team rescue, keeping every real game untouched.
 update public.games set status='active',finished_at=null,winner_id=null,sauron_cooldown_until=now()+interval '1 hour',config='{"route":[[47.2,18.6],[47.201,18.601]],"sauron_position":[47.2,18.6]}' where id=gid;
 update public.items set status='sauron',owner_id=null,destroyed_at=null,ring_share_seconds=0 where game_id=gid;
 insert into game_private.ring_custody(item_id,player_id) select unnest(ids),pid;
 update public.player_locations set sharing_enabled=false where game_id=gid and player_id=other_pid;
 result:=public.game_action(uid,'state','{}',sid);
 if result->'game'->>'status'<>'active' then raise exception 'All Sauron rings ended the game';end if;
 if result->'rescue'->>'started_at' is not null then raise exception 'Rescue started without all players';end if;
 perform public.game_action(uid,'recover',jsonb_build_object('item',ids[2]),sid);
 if not exists(select 1 from public.items where id=ids[2] and status='owned' and ring_share_seconds=0) then raise exception 'Recovery retained old time';end if;
 update public.items set status='sauron',owner_id=null where id=ids[2];insert into game_private.ring_custody(item_id,player_id) values(ids[2],pid);
 update public.player_locations set sharing_enabled=true,updated_at=now() where game_id=gid;
 result:=public.game_action(uid,'state','{}',sid);
 if result->'rescue'->>'started_at' is null then raise exception 'All-shared rescue did not start';end if;
 update public.games set config=config||jsonb_build_object('rescue_started_at',now()-interval '4 minutes','rescue_checked_at',now()) where id=gid;
 perform public.game_action(other_uid,'stop','{}',other_sid);
 if (select config->>'rescue_started_at' from public.games where id=gid) is not null then raise exception 'Stop did not reset rescue';end if;
 update public.player_locations set sharing_enabled=true,updated_at=now() where game_id=gid;
 update public.games set config=config||jsonb_build_object('rescue_started_at',now()-interval '5 minutes','rescue_checked_at',now()) where id=gid;
 update public.player_locations set updated_at=now()-interval '31 seconds' where player_id=other_pid;
 perform public.game_action(uid,'state','{}',sid);
 if (select config->>'rescue_started_at' from public.games where id=gid) is not null then raise exception 'Stale sharing did not reset rescue';end if;
 -- Capture while everybody shares: old rescue time must not survive.
 update public.player_locations set sharing_enabled=true,updated_at=now() where game_id=gid;
 update public.player_locations set immune_until=null where player_id=pid;
 update public.items set status='owned',owner_id=pid,collected_at=now(),ring_share_seconds=3600 where id=ids[1];
 delete from game_private.ring_custody where item_id=ids[1];
 update public.games set sauron_cooldown_until=now()-interval '1 second',config=config||jsonb_build_object('sauron_position',jsonb_build_array(47.2,18.6),'sauron_tick_at',now(),'rescue_started_at',now()-interval '4 minutes','rescue_checked_at',now()) where id=gid;
 result:=public.game_action(uid,'state','{}',sid);
 if not exists(select 1 from public.items where id=ids[1] and status='sauron' and ring_share_seconds=0) or (result->'rescue'->>'elapsed_seconds')::int<>0 then raise exception 'Capture did not reset ring/rescue';end if;
 update public.games set config=config||jsonb_build_object('rescue_started_at',now()-interval '5 minutes','rescue_checked_at',now()) where id=gid;
 result:=public.game_action(uid,'state','{}',sid);
 if (select count(*) from public.items where game_id=gid and status='ground' and latitude=47.2 and longitude=18.6)<>6 then raise exception 'Rescue did not restore original locations';end if;
 if exists(select 1 from game_private.ring_custody where item_id=any(ids)) then raise exception 'Rescue left custody records';end if;
 if (select count(*) from public.game_events where game_id=gid and event_type='sauron_release')<>6 then raise exception 'Missing release audit';end if;
 if result->'game'->>'status'<>'active' then raise exception 'Rescue ended the game';end if;
 perform public.game_action(uid,'pickup',jsonb_build_object('item',ids[1]),sid);
 if not exists(select 1 from public.items where id=ids[1] and status='owned' and owner_id=pid and ring_share_seconds=0) then raise exception 'Released ring cannot be picked up cleanly';end if;
 rejected:=false;begin perform public.game_action(uid,'color',jsonb_build_object('color_id',old_color),sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Active-game color change accepted';end if;
 if (select count(distinct color_id)=count(*) from public.players) is not true then raise exception 'Colors not globally unique';end if;
end $$;
select 'PASS: ring-specific ownership time, stale gaps, stop segments, 3599/3600 boundary, atomic destroy-all, only six-ring finish, robbery reset, frozen round colors, unique/pre-game-only colors; team rescue all-player requirement, stop/stale/capture reset, original positions, clean pickup and continued game' as result;
rollback;
