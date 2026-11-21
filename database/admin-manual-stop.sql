-- Add explicit administrator cancellation without altering six-ring victory.
DO $patch$
DECLARE definition text:=pg_get_functiondef('public.game_action(uuid,text,jsonb,uuid)'::regprocedure);
BEGIN
 IF strpos(definition,$needle$ elsif p_action='place_ring' then$needle$)=0 OR strpos(definition,$needle$p_action='abort'$needle$)>0 THEN RAISE EXCEPTION 'Unexpected game_action version'; END IF;
 EXECUTE replace(definition,$needle$ elsif p_action='place_ring' then$needle$,$replacement$ elsif p_action='abort' then
  if not me.is_admin or g.id is null then raise exception 'Csak admin, létező játékban.'; end if;
  if g.status<>'active' then raise exception 'Csak futó játék állítható le.'; end if;
  if p_data->>'confirm' is distinct from 'true' or p_data->>'game' is distinct from g.id::text then raise exception 'Az aktuális játék leállítását meg kell erősíteni.'; end if;
  update public.games set status='finished',finished_at=now(),winner_id=null,
   config=config||jsonb_build_object('finish_reason','cancelled','cancelled_by',me.id,'rescue_started_at',null,'rescue_checked_at',null) where id=g.id returning * into g;
  update public.player_locations set sharing_enabled=false,active_seconds=0 where game_id=g.id;
  insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,me.id,'admin_cancel',jsonb_build_object('reason','manual_stop'));
 elsif p_action='place_ring' then$replacement$);
END
$patch$;
