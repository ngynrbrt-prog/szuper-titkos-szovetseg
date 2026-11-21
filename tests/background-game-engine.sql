begin;
do $$
declare gid uuid; g public.games; first jsonb; dist float8;
begin
 insert into public.games(city_name,city_lat,city_lng,mordor_lat,mordor_lng,status,started_at,created_at,config)
 values('Rollback background engine',47.2,18.6,47.2,18.6,'active',now(),now()+interval '5 days',
 jsonb_build_object('route',jsonb_build_array(jsonb_build_array(47.2,18.6),jsonb_build_array(47.22,18.6)),
 'sauron_position',jsonb_build_array(47.2,18.6),'sauron_last_seen',jsonb_build_array(47.22,18.6),'sauron_pursuit_player',gen_random_uuid(),'sauron_tick_at',now()-interval '30 seconds')) returning id into gid;
 g:=game_private.tick_game(gid);
 dist:=game_private.distance(47.2,18.6,(g.config->'sauron_position'->>0)::float8,(g.config->'sauron_position'->>1)::float8);
 if dist not between 124.8 and 125.2 then raise exception 'Expected 125 metres per 30 seconds at 15km/h, got %',dist;end if;
 first:=g.config->'sauron_position';g:=game_private.tick_game(gid);
 if g.config->'sauron_position'<>first then raise exception 'Duplicate same-time tick moved twice';end if;
 update public.games set status='preparation',config=config||jsonb_build_object('sauron_tick_at',now()-interval '30 seconds') where id=gid;
 g:=game_private.tick_game(gid);
 if g.config->'sauron_position'<>first then raise exception 'Preparation game moved';end if;
 update public.games set status='finished',config=config||jsonb_build_object('finish_reason','cancelled') where id=gid;
 g:=game_private.tick_game(gid);
 if g.config->'sauron_position'<>first then raise exception 'Finished game moved';end if;
 if has_function_privilege('anon','game_private.tick_game(uuid)','EXECUTE') or has_function_privilege('authenticated','game_private.tick_active_games()','EXECUTE') then raise exception 'Background engine exposed';end if;
end $$;
rollback;
select 'PASS: no client GPS/auth request required, 15km/h = 125m/30s, no duplicate movement, preparation/finished stationary, engine private' as result;
