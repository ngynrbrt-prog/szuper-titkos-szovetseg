-- Only fixture data: all changes are rolled back.
begin;
do $$
declare uid uuid; pid uuid; ouid uuid; opid uuid; sid uuid:=gen_random_uuid(); osid uuid:=gen_random_uuid(); gid uuid; item uuid; result jsonb; n int;
begin
 select auth_user_id,id into uid,pid from public.players where is_admin and registration_completed limit 1;
 select auth_user_id,id into ouid,opid from public.players where not is_admin and registration_completed limit 1;
 insert into auth.sessions(id,user_id) values(sid,uid),(osid,ouid);
 insert into public.games(city_name,city_lat,city_lng,mordor_lat,mordor_lng,status,started_at,created_at,config)
 values('Rollback Sauron visibility',47.2,18.6,47.2,18.6,'active',now()-interval '1 hour',now()+interval '3 days','{"route":[[47.201,18.6],[47.202,18.601]],"sauron_position":[47.201,18.6]}') returning id into gid;
 insert into public.game_results(game_id,player_id) select gid,id from public.players;
 insert into public.items(game_id,item_type,item_name,latitude,longitude,status,owner_id,collected_at) values(gid,'ring','Visibility fixture',47.2,18.6,'owned',pid,now()-interval '1 hour') returning id into item;
 insert into public.player_locations(player_id,game_id,latitude,longitude,accuracy_m,sharing_enabled,updated_at,immune_until)
 select id,gid,47.2,18.6,5,true,now(),now()+interval '1 day' from public.players where id in(pid,opid)
 on conflict(player_id) do update set game_id=excluded.game_id,latitude=excluded.latitude,longitude=excluded.longitude,accuracy_m=5,sharing_enabled=true,updated_at=now(),immune_until=excluded.immune_until;
 for n in 0..7 loop
  update public.items set status='owned',owner_id=pid where id=item;
  update public.player_locations set sharing_enabled=true,updated_at=now(),accuracy_m=5 where player_id=pid;
  update public.games set sauron_cooldown_until=null where id=gid;
  if n=0 then update public.player_locations set sharing_enabled=false where player_id=pid;
  elsif n=2 then update public.items set status='ground',owner_id=null where id=item;
  elsif n=3 then update public.items set owner_id=opid where id=item;
  elsif n=4 then update public.player_locations set updated_at=now()-interval '30 seconds' where player_id=pid;
  elsif n=5 then update public.player_locations set accuracy_m=51 where player_id=pid;
  elsif n=6 then update public.games set sauron_cooldown_until=now()+interval '1 hour' where id=gid;
  elsif n=7 then update public.player_locations set sharing_enabled=false where player_id=pid;
  end if;
  result:=public.game_action(uid,'state','{}',sid);
  if n=1 then
   if result->'sauron'='null'::jsonb then raise exception 'Eligible ring sharer cannot see Sauron';end if;
  elsif result->'sauron'<>'null'::jsonb then raise exception 'Ineligible viewer saw Sauron, case %',n;end if;
  if (result->'game'->'config') ?| array['sauron_position','sauron_target','sauron_tick_at'] then raise exception 'Private position leaked in config';end if;
 end loop;
 update public.games set sauron_cooldown_until=null where id=gid;
 update public.items set status='owned',owner_id=pid where id=item;
 update public.player_locations set sharing_enabled=true,updated_at=now(),accuracy_m=5 where player_id=pid;
 result:=public.game_action(ouid,'state','{}',osid);
 if result->'sauron'<>'null'::jsonb then raise exception 'Another players ring enabled viewer';end if;
 result:=public.game_action(uid,'stop','{}',sid);
 if result->'sauron'<>'null'::jsonb then raise exception 'Stop still shows Sauron';end if;
 update public.player_locations set sharing_enabled=true,updated_at=now(),immune_until=null where player_id=pid;
 update public.games set config=config||jsonb_build_object('sauron_position',jsonb_build_array(47.2,18.6),'sauron_tick_at',now()) where id=gid;
 result:=public.game_action(uid,'state','{}',sid);
 if not exists(select 1 from public.items where id=item and status='sauron') or result->'sauron'<>'null'::jsonb then raise exception 'Captured final ring did not hide Sauron';end if;
end $$;
rollback;
select 'PASS: own ring plus fresh accurate sharing only; stopped/missing/foreign/stale/inaccurate/cooldown hidden; no admin bypass; no config coordinate leak; final-ring capture immediately hidden' as result;
