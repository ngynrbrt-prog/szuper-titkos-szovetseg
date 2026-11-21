DO $patch$
DECLARE definition text:=pg_get_functiondef('public.game_action(uuid,text,jsonb,uuid)'::regprocedure);
BEGIN
 IF strpos(definition,$before$'sauron',case when g.id is not null and coalesce(g.sauron_cooldown_until,'-infinity')<=now() then coalesce(g.config->'sauron_position',game_private.sauron(g)) else null end,$before$)=0 OR strpos(definition,$before$'game',case when g.id is null then null else to_jsonb(g) end,$before$)=0 THEN RAISE EXCEPTION 'Unexpected game_action response'; END IF;
 definition:=replace(definition,$before$'sauron',case when g.id is not null and coalesce(g.sauron_cooldown_until,'-infinity')<=now() then coalesce(g.config->'sauron_position',game_private.sauron(g)) else null end,$before$,$after$'sauron',case when g.status='active' and coalesce(g.sauron_cooldown_until,'-infinity')<=now()
    and exists(select 1 from public.items where game_id=g.id and owner_id=me.id and item_type='ring' and status='owned')
    and exists(select 1 from public.player_locations where game_id=g.id and player_id=me.id and sharing_enabled and updated_at>now()-interval '30 seconds' and accuracy_m<=50)
    then coalesce(g.config->'sauron_position',game_private.sauron(g)) else null end,$after$);
 EXECUTE replace(definition,$before$'game',case when g.id is null then null else to_jsonb(g) end,$before$,$after$'game',case when g.id is null then null else to_jsonb(g)||jsonb_build_object('config',g.config-'sauron_position'-'sauron_tick_at'-'sauron_target') end,$after$);
END
$patch$;
