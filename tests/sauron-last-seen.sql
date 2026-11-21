begin;
do $$
declare uid uuid; pid uuid; sid uuid:=gen_random_uuid(); gid uuid; iid uuid; r jsonb; cfg jsonb; prior float8; dist float8; n int;
begin
 select auth_user_id,id into uid,pid from public.players where is_admin and registration_completed limit 1;
 insert into auth.sessions(id,user_id) values(sid,uid);
 insert into public.games(city_name,city_lat,city_lng,mordor_lat,mordor_lng,status,started_at,created_at,config)
 values('Rollback last seen pursuit',47.2,18.6,47.2,18.6,'active',now()-interval '1 hour',now()+interval '4 days','{"route":[[47.19,18.59],[47.191,18.591]],"sauron_position":[47.198,18.6]}') returning id into gid;
 insert into public.items(game_id,item_type,item_name,latitude,longitude,status,owner_id,collected_at) values(gid,'ring','Pursuit fixture',47.2,18.6,'owned',pid,now()-interval '1 hour') returning id into iid;
 insert into public.player_locations(player_id,game_id,latitude,longitude,accuracy_m,sharing_enabled,updated_at,immune_until) values(pid,gid,47.2,18.6,5,true,now(),now()+interval '1 day')
 on conflict(player_id) do update set game_id=gid,latitude=47.2,longitude=18.6,accuracy_m=5,sharing_enabled=true,updated_at=now(),immune_until=now()+interval '1 day';
 r:=public.game_action(uid,'state','{}',sid);
 select config into cfg from public.games where id=gid;
 if cfg->'sauron_last_seen'<>'[47.2,18.6]'::jsonb or cfg->>'sauron_pursuit_player'<>pid::text then raise exception 'No last-seen memory';end if;
 update public.player_locations set latitude=47.2005 where player_id=pid;
 perform public.game_action(uid,'state','{}',sid);
 select config into cfg from public.games where id=gid;
 if cfg->'sauron_last_seen'<>'[47.2005,18.6]'::jsonb then raise exception 'Fresh target did not update memory';end if;
 r:=public.game_action(uid,'stop','{}',sid);
 if r->'sauron'<>'null'::jsonb or (r->'game'->'config') ?| array['sauron_last_seen','sauron_pursuit_player'] then raise exception 'Stopped player sees private pursuit';end if;
 update public.player_locations set immune_until=null where player_id=pid;
 prior:=100000;
 for n in 1..12 loop
  update public.games set config=config||jsonb_build_object('sauron_tick_at',now()-interval '30 seconds') where id=gid;
  perform public.game_action(uid,'state','{}',sid);
  select config into cfg from public.games where id=gid;
  dist:=game_private.distance((cfg->'sauron_position'->>0)::float8,(cfg->'sauron_position'->>1)::float8,47.2005,18.6);
  if dist>prior+0.1 then raise exception 'Turned away before reaching last sighting';end if;
  prior:=dist;
  exit when not(cfg ? 'sauron_last_seen');
 end loop;
 if dist>=0.5 or cfg ? 'sauron_last_seen' or cfg ? 'sauron_pursuit_player' then raise exception 'Did not reach and clear empty last-seen point';end if;
 if not exists(select 1 from public.items where id=iid and status='owned' and owner_id=pid) then raise exception 'Offline player was robbed';end if;
 update public.games set config=config||jsonb_build_object('sauron_tick_at',now()-interval '30 seconds') where id=gid;
 perform public.game_action(uid,'state','{}',sid);
 select config into cfg from public.games where id=gid;
 if (cfg->'sauron_position'->>1)::float8>=18.6 then raise exception 'Did not return toward patrol route';end if;
end $$;
rollback;
select 'PASS: fresh ring-owner memory, latest position update, stop preserves pursuit, reaches exact empty point before return, no offline capture, private memory redacted, patrol resumes' as result;
