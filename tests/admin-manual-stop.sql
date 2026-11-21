-- Fixture-only checks; all sessions, game and locations roll back.
begin;
do $$
declare uid uuid; pid uuid; ouid uuid; opid uuid; sid uuid:=gen_random_uuid(); osid uuid:=gen_random_uuid(); gid uuid; result jsonb; rejected boolean;
begin
 select auth_user_id,id into uid,pid from public.players where is_admin and registration_completed limit 1;
 select auth_user_id,id into ouid,opid from public.players where not is_admin and registration_completed limit 1;
 insert into auth.sessions(id,user_id) values(sid,uid),(osid,ouid);
 insert into public.games(city_name,city_lat,city_lng,mordor_lat,mordor_lng,status,started_at,created_at,config)
 values('Rollback admin stop',47.2,18.6,47.2,18.6,'active',now()-interval '1 hour',now()+interval '2 days','{"rescue_started_at":"2026-11-21T00:00:00Z","route":[[47.2,18.6],[47.201,18.601]],"sauron_position":[47.2,18.6]}') returning id into gid;
 insert into public.game_results(game_id,player_id) select gid,id from public.players;
 insert into public.player_locations(player_id,game_id,latitude,longitude,accuracy_m,sharing_enabled,updated_at) values(pid,gid,47.2,18.6,5,true,now())
 on conflict(player_id) do update set game_id=excluded.game_id,sharing_enabled=true,updated_at=now();
 rejected:=false;begin perform public.game_action(ouid,'abort',jsonb_build_object('game',gid,'confirm',true),osid);exception when others then rejected:=true;end;if not rejected then raise exception 'Non-admin could stop';end if;
 rejected:=false;begin perform public.game_action(uid,'abort',jsonb_build_object('game',gid),sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Missing confirmation accepted';end if;
 rejected:=false;begin perform public.game_action(uid,'abort',jsonb_build_object('game',gen_random_uuid(),'confirm',true),sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Wrong game accepted';end if;
 rejected:=false;begin perform public.game_action(uid,'abort',jsonb_build_object('game',gid,'confirm',true),gen_random_uuid());exception when others then rejected:=true;end;if not rejected then raise exception 'Fake session accepted';end if;
 result:=public.game_action(uid,'abort',jsonb_build_object('game',gid,'confirm',true),sid);
 if result->'game'->>'status'<>'finished' or result->'game'->'config'->>'finish_reason'<>'cancelled' then raise exception 'Not cancelled';end if;
 if exists(select 1 from public.games where id=gid and (winner_id is not null or finished_at is null or config->>'rescue_started_at' is not null)) then raise exception 'Winner/timer not cleared';end if;
 if exists(select 1 from public.player_locations where game_id=gid and sharing_enabled) then raise exception 'Location still shared';end if;
 if not exists(select 1 from public.game_events where game_id=gid and player_id=pid and event_type='admin_cancel') then raise exception 'No audit event';end if;
 if result->'last_round'->>'id'=gid::text or exists(select 1 from jsonb_array_elements(result->'archive') a where a->>'id'=gid::text) then raise exception 'Cancelled round reported as victory';end if;
 rejected:=false;begin perform public.game_action(uid,'abort',jsonb_build_object('game',gid,'confirm',true),sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Repeated stop accepted';end if;
 update public.games set status='preparation',started_at=null,finished_at=null where id=gid;
 rejected:=false;begin perform public.game_action(uid,'abort',jsonb_build_object('game',gid,'confirm',true),sid);exception when others then rejected:=true;end;if not rejected then raise exception 'Preparation abort accepted';end if;
 perform public.game_action(uid,'finish','{}',sid);
 if not exists(select 1 from public.games where id=gid and status='finished') then raise exception 'Preparation discard broken';end if;
end $$;
rollback;
select 'PASS admin cancellation: role/session/confirmation/game guards, active stop, no winner, sharing stopped, rescue reset, event, excluded summaries, repeat rejected, preparation discard preserved' as result;
