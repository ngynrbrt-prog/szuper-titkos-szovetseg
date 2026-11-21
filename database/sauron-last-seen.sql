DO $patch$
DECLARE definition text:=pg_get_functiondef('public.game_action(uuid,text,jsonb,uuid)'::regprocedure);
BEGIN
 IF strpos(definition,$before$  select l.* into target from public.player_locations l
   where l.game_id=g.id and l.sharing_enabled and l.updated_at>now()-interval '30 seconds' and l.accuracy_m<=50
     and exists (select 1 from public.items i where i.game_id=l.game_id and i.owner_id=l.player_id and i.item_type='ring' and i.status='owned')
   order by game_private.distance((origin->>0)::float8,(origin->>1)::float8,l.latitude,l.longitude),l.player_id limit 1;
  destination:=case when target.player_id is null then game_private.sauron(g) else jsonb_build_array(target.latitude,target.longitude) end;
$before$)=0 THEN RAISE EXCEPTION 'Unexpected pursuit function'; END IF;
 definition:=replace(definition,$before$  select l.* into target from public.player_locations l
   where l.game_id=g.id and l.sharing_enabled and l.updated_at>now()-interval '30 seconds' and l.accuracy_m<=50
     and exists (select 1 from public.items i where i.game_id=l.game_id and i.owner_id=l.player_id and i.item_type='ring' and i.status='owned')
   order by game_private.distance((origin->>0)::float8,(origin->>1)::float8,l.latitude,l.longitude),l.player_id limit 1;
  destination:=case when target.player_id is null then game_private.sauron(g) else jsonb_build_array(target.latitude,target.longitude) end;
$before$,$after$  select l.* into target from public.player_locations l
   where l.game_id=g.id and l.sharing_enabled and l.updated_at>now()-interval '30 seconds' and l.accuracy_m<=50
     and (g.config->>'sauron_pursuit_player' is null or l.player_id=(g.config->>'sauron_pursuit_player')::uuid)
     and exists (select 1 from public.items i where i.game_id=l.game_id and i.owner_id=l.player_id and i.item_type='ring' and i.status='owned')
   order by game_private.distance((origin->>0)::float8,(origin->>1)::float8,l.latitude,l.longitude),l.player_id limit 1;
  if target.player_id is not null then
   g.config:=g.config||jsonb_build_object('sauron_last_seen',jsonb_build_array(target.latitude,target.longitude),'sauron_pursuit_player',target.player_id);
  end if;
  destination:=coalesce(g.config->'sauron_last_seen',game_private.sauron(g));
$after$);
 IF strpos(definition,$before$  update public.games set config=config||jsonb_build_object('sauron_position',s,'sauron_tick_at',now(),'sauron_target',target.player_id)$before$)=0 THEN RAISE EXCEPTION 'Unexpected pursuit function'; END IF;
 definition:=replace(definition,$before$  update public.games set config=config||jsonb_build_object('sauron_position',s,'sauron_tick_at',now(),'sauron_target',target.player_id)$before$,$after$  if target.player_id is null and g.config->'sauron_last_seen' is not null
    and game_private.distance((s->>0)::float8,(s->>1)::float8,(destination->>0)::float8,(destination->>1)::float8)<0.5 then
   g.config:=g.config-'sauron_last_seen'-'sauron_pursuit_player';
  end if;
  update public.games set config=g.config||jsonb_build_object('sauron_position',s,'sauron_tick_at',now(),'sauron_target',target.player_id)$after$);
 IF strpos(definition,$before$g.config-'sauron_position'-'sauron_tick_at'-'sauron_target'$before$)=0 THEN RAISE EXCEPTION 'Unexpected pursuit function'; END IF;
 definition:=replace(definition,$before$g.config-'sauron_position'-'sauron_tick_at'-'sauron_target'$before$,$after$g.config-'sauron_position'-'sauron_tick_at'-'sauron_target'-'sauron_last_seen'-'sauron_pursuit_player'$after$);
 EXECUTE definition;
END
$patch$;
