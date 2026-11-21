DO $patch$
DECLARE definition text:=pg_get_functiondef('public.game_action(uuid,text,jsonb,uuid)'::regprocedure);
BEGIN
 IF strpos(definition,$before$select count(*)>0 and bool_and(exists(select 1 from public.player_locations l where l.player_id=p.id and l.game_id=g.id and l.sharing_enabled and l.accuracy_m<=50 and l.updated_at>now()-interval '30 seconds'))$before$)=0 THEN RAISE EXCEPTION 'Unexpected rescue function'; END IF;
 EXECUTE replace(definition,$before$select count(*)>0 and bool_and(exists(select 1 from public.player_locations l where l.player_id=p.id and l.game_id=g.id and l.sharing_enabled and l.accuracy_m<=50 and l.updated_at>now()-interval '30 seconds'))$before$,$after$select count(*)>0 and bool_and(exists(select 1 from public.player_locations l where l.player_id=p.id and l.game_id=g.id and l.sharing_enabled and l.accuracy_m<=50 and l.updated_at>now()-interval '30 seconds')) and not exists(select 1 from public.items remaining where remaining.game_id=g.id and remaining.item_type='ring' and remaining.status='ground')$after$);
END
$patch$;
