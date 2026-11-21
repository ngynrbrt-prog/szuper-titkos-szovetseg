CREATE OR REPLACE FUNCTION game_private.tick_game(p_game uuid) RETURNS public.games
LANGUAGE plpgsql SET search_path='' AS $engine$
DECLARE g public.games; target public.player_locations; other public.players; it public.items; v_id uuid;
 origin jsonb; destination jsonb; s jsonb; tick_at timestamptz; meters float8; fraction float8;
 all_sharing boolean; rescue_start timestamptz; rescued integer;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(987654321);
 SELECT * INTO g FROM public.games WHERE id=p_game FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 -- Tick only considers recent, explicitly shared positions; stale/offline players are never caught.
 if g.status='active' then
  origin:=coalesce(g.config->'sauron_position',g.config->'route'->0,jsonb_build_array(g.city_lat,g.city_lng));
  tick_at:=coalesce((g.config->>'sauron_tick_at')::timestamptz,now());
  select l.* into target from public.player_locations l
   where l.game_id=g.id and l.sharing_enabled and l.updated_at>now()-interval '30 seconds' and l.accuracy_m<=50
     and (g.config->>'sauron_pursuit_player' is null or l.player_id=(g.config->>'sauron_pursuit_player')::uuid)
     and exists (select 1 from public.items i where i.game_id=l.game_id and i.owner_id=l.player_id and i.item_type='ring' and i.status='owned')
   order by game_private.distance((origin->>0)::float8,(origin->>1)::float8,l.latitude,l.longitude),l.player_id limit 1;
  if target.player_id is not null then
   g.config:=g.config||jsonb_build_object('sauron_last_seen',jsonb_build_array(target.latitude,target.longitude),'sauron_pursuit_player',target.player_id);
  end if;
  destination:=coalesce(g.config->'sauron_last_seen',game_private.sauron(g));
  s:=origin;
  if destination is not null then
   meters:=game_private.distance((origin->>0)::float8,(origin->>1)::float8,(destination->>0)::float8,(destination->>1)::float8);
   if meters>0 then
    fraction:=least(1,greatest(0,least(30,extract(epoch from now()-tick_at)))*15000/3600/meters);
    s:=jsonb_build_array((origin->>0)::float8+((destination->>0)::float8-(origin->>0)::float8)*fraction,
      (origin->>1)::float8+((destination->>1)::float8-(origin->>1)::float8)*fraction);
   end if;
  end if;
  if target.player_id is null and g.config->'sauron_last_seen' is not null
    and game_private.distance((s->>0)::float8,(s->>1)::float8,(destination->>0)::float8,(destination->>1)::float8)<0.5 then
   g.config:=g.config-'sauron_last_seen'-'sauron_pursuit_player';
  end if;
  update public.games set config=g.config||jsonb_build_object('sauron_position',s,'sauron_tick_at',now(),'sauron_target',target.player_id)
   where id=g.id returning * into g;
  if coalesce(g.sauron_cooldown_until,'-infinity')<=now() then
   select p.* into other from public.players p join public.player_locations l on l.player_id=p.id
    where p.id=target.player_id and coalesce(l.immune_until,'-infinity')<=now()
     and game_private.distance(l.latitude,l.longitude,(s->>0)::float8,(s->>1)::float8)<=50
     and exists(select 1 from public.items where game_id=g.id and owner_id=p.id and item_type='ring' and status='owned');
   if found then
    select * into it from public.items where game_id=g.id and owner_id=other.id and status='owned' and item_type='ring' order by id limit 1;
    insert into game_private.ring_custody(item_id,player_id) values(it.id,other.id) on conflict(item_id) do update set player_id=other.id;
    update public.items set owner_id=null,status='sauron',ring_share_seconds=0 where id=it.id;
    update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null,'rescue_last_capture_at',now()),sauron_cooldown_until=now()+interval '60 minutes' where id=g.id returning * into g;
    insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,other.id,'sauron',jsonb_build_object('item',it.id));
   end if;
  end if;

  -- Every registered player must continuously share fresh positions. A capture or stale gap restarts the five minutes.
  if exists(select 1 from public.items where game_id=g.id and item_type='ring' and status='sauron') then
   select count(*)>0 and bool_and(exists(select 1 from public.player_locations l where l.player_id=p.id and l.game_id=g.id and l.sharing_enabled and l.accuracy_m<=50 and l.updated_at>now()-interval '30 seconds')) and not exists(select 1 from public.items remaining where remaining.game_id=g.id and remaining.item_type='ring' and remaining.status='ground')
    into all_sharing from public.players p where registration_completed;
   rescue_start:=(g.config->>'rescue_started_at')::timestamptz;
   if all_sharing then
    if rescue_start is null or coalesce((g.config->>'rescue_checked_at')::timestamptz,'-infinity')<=now()-interval '30 seconds' then
     update public.games set config=config||jsonb_build_object('rescue_started_at',now(),'rescue_checked_at',now()) where id=g.id returning * into g;
    elsif rescue_start<=now()-interval '5 minutes' then
     insert into public.game_events(game_id,player_id,event_type,event_data) select g.id,null,'sauron_release',jsonb_build_object('item',id) from public.items where game_id=g.id and item_type='ring' and status='sauron';
     delete from game_private.ring_custody c using public.items i where c.item_id=i.id and i.game_id=g.id and i.item_type='ring' and i.status='sauron';
     update public.items set status='ground',owner_id=null,collected_at=null,ring_share_seconds=0 where game_id=g.id and item_type='ring' and status='sauron';
     get diagnostics rescued=row_count;
     update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null,'rescue_completed_at',now(),'rescue_released',rescued) where id=g.id returning * into g;
    else
     update public.games set config=config||jsonb_build_object('rescue_checked_at',now()) where id=g.id returning * into g;
    end if;
   elsif rescue_start is not null then
    update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null) where id=g.id returning * into g;
   end if;
  end if;
  if (select count(*) from public.items where game_id=g.id and item_type='ring' and status='destroyed')=6 then
   update public.games set status='finished',finished_at=now(),winner_id=null,
    config=config||jsonb_build_object('finish_reason','all_rings_destroyed','summary_players',
     (select jsonb_agg(jsonb_build_object('id',id,'character_name',character_name,'avatar',avatar,'color_id',color_id)) from public.players))
    where id=g.id returning * into g;
  end if;
 end if;
 if g.status='finished' and g.winner_id is null and g.config->>'finish_reason' is distinct from 'sauron' and coalesce(g.config->>'finish_reason','')<>'cancelled' then
  select player_id into v_id from public.game_results where game_id=g.id order by sestertius_earned desc,rings_destroyed desc,ring_seconds desc,player_id limit 1;
  update public.games set winner_id=v_id where id=g.id returning * into g;
 end if;
 RETURN g;
END $engine$;
REVOKE ALL ON FUNCTION game_private.tick_game(uuid) FROM PUBLIC, anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION game_private.tick_active_games() RETURNS integer
LANGUAGE plpgsql SET search_path='' AS $runner$
DECLARE game_id uuid; processed integer:=0;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(987654321);
 FOR game_id IN SELECT id FROM public.games WHERE status='active' ORDER BY created_at LOOP
  PERFORM game_private.tick_game(game_id); processed:=processed+1;
 END LOOP;
 RETURN processed;
END $runner$;
REVOKE ALL ON FUNCTION game_private.tick_active_games() FROM PUBLIC, anon, authenticated, service_role;
DO $patch$
DECLARE definition text:=pg_get_functiondef('public.game_action(uuid,text,jsonb,uuid)'::regprocedure); patrol text:=pg_get_functiondef('game_private.sauron(public.games)'::regprocedure);
BEGIN
 IF strpos(definition,$old$ -- Tick only considers recent, explicitly shared positions; stale/offline players are never caught.
 if g.status='active' then
  origin:=coalesce(g.config->'sauron_position',g.config->'route'->0,jsonb_build_array(g.city_lat,g.city_lng));
  tick_at:=coalesce((g.config->>'sauron_tick_at')::timestamptz,now());
  select l.* into target from public.player_locations l
   where l.game_id=g.id and l.sharing_enabled and l.updated_at>now()-interval '30 seconds' and l.accuracy_m<=50
     and (g.config->>'sauron_pursuit_player' is null or l.player_id=(g.config->>'sauron_pursuit_player')::uuid)
     and exists (select 1 from public.items i where i.game_id=l.game_id and i.owner_id=l.player_id and i.item_type='ring' and i.status='owned')
   order by game_private.distance((origin->>0)::float8,(origin->>1)::float8,l.latitude,l.longitude),l.player_id limit 1;
  if target.player_id is not null then
   g.config:=g.config||jsonb_build_object('sauron_last_seen',jsonb_build_array(target.latitude,target.longitude),'sauron_pursuit_player',target.player_id);
  end if;
  destination:=coalesce(g.config->'sauron_last_seen',game_private.sauron(g));
  s:=origin;
  if destination is not null then
   meters:=game_private.distance((origin->>0)::float8,(origin->>1)::float8,(destination->>0)::float8,(destination->>1)::float8);
   if meters>0 then
    fraction:=least(1,greatest(0,least(30,extract(epoch from now()-tick_at)))*6000/3600/meters);
    s:=jsonb_build_array((origin->>0)::float8+((destination->>0)::float8-(origin->>0)::float8)*fraction,
      (origin->>1)::float8+((destination->>1)::float8-(origin->>1)::float8)*fraction);
   end if;
  end if;
  if target.player_id is null and g.config->'sauron_last_seen' is not null
    and game_private.distance((s->>0)::float8,(s->>1)::float8,(destination->>0)::float8,(destination->>1)::float8)<0.5 then
   g.config:=g.config-'sauron_last_seen'-'sauron_pursuit_player';
  end if;
  update public.games set config=g.config||jsonb_build_object('sauron_position',s,'sauron_tick_at',now(),'sauron_target',target.player_id)
   where id=g.id returning * into g;
  if coalesce(g.sauron_cooldown_until,'-infinity')<=now() then
   select p.* into other from public.players p join public.player_locations l on l.player_id=p.id
    where p.id=target.player_id and coalesce(l.immune_until,'-infinity')<=now()
     and game_private.distance(l.latitude,l.longitude,(s->>0)::float8,(s->>1)::float8)<=50
     and exists(select 1 from public.items where game_id=g.id and owner_id=p.id and item_type='ring' and status='owned');
   if found then
    select * into it from public.items where game_id=g.id and owner_id=other.id and status='owned' and item_type='ring' order by id limit 1;
    insert into game_private.ring_custody(item_id,player_id) values(it.id,other.id) on conflict(item_id) do update set player_id=other.id;
    update public.items set owner_id=null,status='sauron',ring_share_seconds=0 where id=it.id;
    update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null,'rescue_last_capture_at',now()),sauron_cooldown_until=now()+interval '60 minutes' where id=g.id returning * into g;
    insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,other.id,'sauron',jsonb_build_object('item',it.id));
   end if;
  end if;

  -- Every registered player must continuously share fresh positions. A capture or stale gap restarts the five minutes.
  if exists(select 1 from public.items where game_id=g.id and item_type='ring' and status='sauron') then
   select count(*)>0 and bool_and(exists(select 1 from public.player_locations l where l.player_id=p.id and l.game_id=g.id and l.sharing_enabled and l.accuracy_m<=50 and l.updated_at>now()-interval '30 seconds')) and not exists(select 1 from public.items remaining where remaining.game_id=g.id and remaining.item_type='ring' and remaining.status='ground')
    into all_sharing from public.players p where registration_completed;
   rescue_start:=(g.config->>'rescue_started_at')::timestamptz;
   if all_sharing then
    if rescue_start is null or coalesce((g.config->>'rescue_checked_at')::timestamptz,'-infinity')<=now()-interval '30 seconds' then
     update public.games set config=config||jsonb_build_object('rescue_started_at',now(),'rescue_checked_at',now()) where id=g.id returning * into g;
    elsif rescue_start<=now()-interval '5 minutes' then
     insert into public.game_events(game_id,player_id,event_type,event_data) select g.id,null,'sauron_release',jsonb_build_object('item',id) from public.items where game_id=g.id and item_type='ring' and status='sauron';
     delete from game_private.ring_custody c using public.items i where c.item_id=i.id and i.game_id=g.id and i.item_type='ring' and i.status='sauron';
     update public.items set status='ground',owner_id=null,collected_at=null,ring_share_seconds=0 where game_id=g.id and item_type='ring' and status='sauron';
     get diagnostics rescued=row_count;
     update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null,'rescue_completed_at',now(),'rescue_released',rescued) where id=g.id returning * into g;
    else
     update public.games set config=config||jsonb_build_object('rescue_checked_at',now()) where id=g.id returning * into g;
    end if;
   elsif rescue_start is not null then
    update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null) where id=g.id returning * into g;
   end if;
  end if;
  if (select count(*) from public.items where game_id=g.id and item_type='ring' and status='destroyed')=6 then
   update public.games set status='finished',finished_at=now(),winner_id=null,
    config=config||jsonb_build_object('finish_reason','all_rings_destroyed','summary_players',
     (select jsonb_agg(jsonb_build_object('id',id,'character_name',character_name,'avatar',avatar,'color_id',color_id)) from public.players))
    where id=g.id returning * into g;
  end if;
 end if;
 if g.status='finished' and g.winner_id is null and g.config->>'finish_reason' is distinct from 'sauron' and coalesce(g.config->>'finish_reason','')<>'cancelled' then
  select player_id into v_id from public.game_results where game_id=g.id order by sestertius_earned desc,rings_destroyed desc,ring_seconds desc,player_id limit 1;
  update public.games set winner_id=v_id where id=g.id returning * into g;
 end if;
$old$)>0 THEN
  EXECUTE replace(definition,$old$ -- Tick only considers recent, explicitly shared positions; stale/offline players are never caught.
 if g.status='active' then
  origin:=coalesce(g.config->'sauron_position',g.config->'route'->0,jsonb_build_array(g.city_lat,g.city_lng));
  tick_at:=coalesce((g.config->>'sauron_tick_at')::timestamptz,now());
  select l.* into target from public.player_locations l
   where l.game_id=g.id and l.sharing_enabled and l.updated_at>now()-interval '30 seconds' and l.accuracy_m<=50
     and (g.config->>'sauron_pursuit_player' is null or l.player_id=(g.config->>'sauron_pursuit_player')::uuid)
     and exists (select 1 from public.items i where i.game_id=l.game_id and i.owner_id=l.player_id and i.item_type='ring' and i.status='owned')
   order by game_private.distance((origin->>0)::float8,(origin->>1)::float8,l.latitude,l.longitude),l.player_id limit 1;
  if target.player_id is not null then
   g.config:=g.config||jsonb_build_object('sauron_last_seen',jsonb_build_array(target.latitude,target.longitude),'sauron_pursuit_player',target.player_id);
  end if;
  destination:=coalesce(g.config->'sauron_last_seen',game_private.sauron(g));
  s:=origin;
  if destination is not null then
   meters:=game_private.distance((origin->>0)::float8,(origin->>1)::float8,(destination->>0)::float8,(destination->>1)::float8);
   if meters>0 then
    fraction:=least(1,greatest(0,least(30,extract(epoch from now()-tick_at)))*6000/3600/meters);
    s:=jsonb_build_array((origin->>0)::float8+((destination->>0)::float8-(origin->>0)::float8)*fraction,
      (origin->>1)::float8+((destination->>1)::float8-(origin->>1)::float8)*fraction);
   end if;
  end if;
  if target.player_id is null and g.config->'sauron_last_seen' is not null
    and game_private.distance((s->>0)::float8,(s->>1)::float8,(destination->>0)::float8,(destination->>1)::float8)<0.5 then
   g.config:=g.config-'sauron_last_seen'-'sauron_pursuit_player';
  end if;
  update public.games set config=g.config||jsonb_build_object('sauron_position',s,'sauron_tick_at',now(),'sauron_target',target.player_id)
   where id=g.id returning * into g;
  if coalesce(g.sauron_cooldown_until,'-infinity')<=now() then
   select p.* into other from public.players p join public.player_locations l on l.player_id=p.id
    where p.id=target.player_id and coalesce(l.immune_until,'-infinity')<=now()
     and game_private.distance(l.latitude,l.longitude,(s->>0)::float8,(s->>1)::float8)<=50
     and exists(select 1 from public.items where game_id=g.id and owner_id=p.id and item_type='ring' and status='owned');
   if found then
    select * into it from public.items where game_id=g.id and owner_id=other.id and status='owned' and item_type='ring' order by id limit 1;
    insert into game_private.ring_custody(item_id,player_id) values(it.id,other.id) on conflict(item_id) do update set player_id=other.id;
    update public.items set owner_id=null,status='sauron',ring_share_seconds=0 where id=it.id;
    update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null,'rescue_last_capture_at',now()),sauron_cooldown_until=now()+interval '60 minutes' where id=g.id returning * into g;
    insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,other.id,'sauron',jsonb_build_object('item',it.id));
   end if;
  end if;

  -- Every registered player must continuously share fresh positions. A capture or stale gap restarts the five minutes.
  if exists(select 1 from public.items where game_id=g.id and item_type='ring' and status='sauron') then
   select count(*)>0 and bool_and(exists(select 1 from public.player_locations l where l.player_id=p.id and l.game_id=g.id and l.sharing_enabled and l.accuracy_m<=50 and l.updated_at>now()-interval '30 seconds')) and not exists(select 1 from public.items remaining where remaining.game_id=g.id and remaining.item_type='ring' and remaining.status='ground')
    into all_sharing from public.players p where registration_completed;
   rescue_start:=(g.config->>'rescue_started_at')::timestamptz;
   if all_sharing then
    if rescue_start is null or coalesce((g.config->>'rescue_checked_at')::timestamptz,'-infinity')<=now()-interval '30 seconds' then
     update public.games set config=config||jsonb_build_object('rescue_started_at',now(),'rescue_checked_at',now()) where id=g.id returning * into g;
    elsif rescue_start<=now()-interval '5 minutes' then
     insert into public.game_events(game_id,player_id,event_type,event_data) select g.id,null,'sauron_release',jsonb_build_object('item',id) from public.items where game_id=g.id and item_type='ring' and status='sauron';
     delete from game_private.ring_custody c using public.items i where c.item_id=i.id and i.game_id=g.id and i.item_type='ring' and i.status='sauron';
     update public.items set status='ground',owner_id=null,collected_at=null,ring_share_seconds=0 where game_id=g.id and item_type='ring' and status='sauron';
     get diagnostics rescued=row_count;
     update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null,'rescue_completed_at',now(),'rescue_released',rescued) where id=g.id returning * into g;
    else
     update public.games set config=config||jsonb_build_object('rescue_checked_at',now()) where id=g.id returning * into g;
    end if;
   elsif rescue_start is not null then
    update public.games set config=config||jsonb_build_object('rescue_started_at',null,'rescue_checked_at',null) where id=g.id returning * into g;
   end if;
  end if;
  if (select count(*) from public.items where game_id=g.id and item_type='ring' and status='destroyed')=6 then
   update public.games set status='finished',finished_at=now(),winner_id=null,
    config=config||jsonb_build_object('finish_reason','all_rings_destroyed','summary_players',
     (select jsonb_agg(jsonb_build_object('id',id,'character_name',character_name,'avatar',avatar,'color_id',color_id)) from public.players))
    where id=g.id returning * into g;
  end if;
 end if;
 if g.status='finished' and g.winner_id is null and g.config->>'finish_reason' is distinct from 'sauron' and coalesce(g.config->>'finish_reason','')<>'cancelled' then
  select player_id into v_id from public.game_results where game_id=g.id order by sestertius_earned desc,rings_destroyed desc,ring_seconds desc,player_id limit 1;
  update public.games set winner_id=v_id where id=g.id returning * into g;
 end if;
$old$,$new$ if g.id is not null then g:=game_private.tick_game(g.id); end if;
$new$);
 ELSIF strpos(definition,'g:=game_private.tick_game(g.id)')=0 THEN RAISE EXCEPTION 'Unexpected game_action engine'; END IF;
 EXECUTE replace(replace(patrol,'6000/3600','15000/3600'),'g.started_at)-1800','g.started_at)');
END
$patch$;
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('szovetseg-game-engine','10 seconds','SELECT game_private.tick_active_games();');
SELECT cron.schedule('szovetseg-game-engine-log-cleanup','15 3 * * *',$cleanup$DELETE FROM cron.job_run_details WHERE jobid=(SELECT jobid FROM cron.job WHERE jobname='szovetseg-game-engine') AND end_time<now()-interval '7 days';$cleanup$);
