create or replace function public.game_action(p_auth uuid,p_action text,p_data jsonb default '{}',p_session uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 me public.players; g public.games; loc public.player_locations; victim public.player_locations;
 it public.items; other public.players; v_id uuid; lat float8; lng float8; acc float8;
 dt int:=0; pts jsonb; route jsonb; pt jsonb; s jsonb; i int; n int; token text; route_length float8:=0;
 ring_names text[]:=array['Anor Arany Fénye','Barad Rubin Lángja','Elbereth Kék Csillaga','Lórien Zöld Álma','Khazad Ezüst Pajzsa','Ithil Lila Árnya'];
begin
 -- Serializes all game changes, including competing pickups and robberies.
 perform pg_catalog.pg_advisory_xact_lock(987654321);
 if not exists(select 1 from auth.sessions where id=p_session and user_id=p_auth) then raise exception 'Lejárt munkamenet.'; end if;
 select * into me from public.players where auth_user_id=p_auth and registration_completed;
 if not found then raise exception 'Nincs jogosultság.'; end if;
 select * into g from public.games order by created_at desc limit 1 for update;
 if p_action='invite' then
  if not me.is_admin then raise exception 'Csak admin.'; end if;
  if (select count(*) from public.players)>=6 then raise exception 'Már hat játékos van.'; end if;
  token:=encode(extensions.gen_random_bytes(24),'hex');
  insert into game_private.invites(token_hash) values(encode(extensions.digest(token,'sha256'),'hex'));
  return jsonb_build_object('invite',token);
 elsif p_action='create' then
  if not me.is_admin then raise exception 'Csak admin.'; end if;
  if g.status in ('active','preparation') then raise exception 'Előbb zárd le az aktuális játékot.'; end if;
  lat:=(p_data->>'lat')::float8; lng:=(p_data->>'lng')::float8;
  if lat is null or lng is null or lat not between -90 and 90 or lng not between -180 and 180 then raise exception 'Érvénytelen városközpont.'; end if;
  pts:=p_data->'points'; route:=p_data->'route';
  if jsonb_typeof(pts) is distinct from 'array' or jsonb_typeof(route) is distinct from 'array' then raise exception 'Helyszínek és útvonal szükséges.'; end if;
  if jsonb_array_length(pts) not between 6 and 100 or jsonb_array_length(route) not between 2 and 100 then raise exception 'Legalább 6 helyszín és 2 útvonalpont kell.'; end if;
  if p_data->>'safe' is distinct from 'true' then raise exception 'A nyilvános gyalogoshelyszínek ellenőrzése szükséges.'; end if;
  for pt in select value from jsonb_array_elements(pts||route||jsonb_build_array(p_data->'mordor')) loop
   if not coalesce(game_private.point(pt,lat,lng),false) then raise exception 'Érvénytelen vagy túl távoli koordináta.'; end if;
  end loop;
  for i in 0..jsonb_array_length(route)-2 loop
   route_length:=route_length+game_private.distance((route->i->>0)::float8,(route->i->>1)::float8,(route->(i+1)->>0)::float8,(route->(i+1)->>1)::float8);
  end loop;
  if route_length<10 then raise exception 'Sauron útvonala legalább 10 méter hosszú legyen.'; end if;
  if length(btrim(coalesce(p_data->>'city','')))=0 then raise exception 'Városnév szükséges.'; end if;
  insert into public.games(city_name,city_lat,city_lng,mordor_lat,mordor_lng,config)
   values(left(btrim(p_data->>'city'),80),lat,lng,(p_data->'mordor'->>0)::float8,(p_data->'mordor'->>1)::float8,jsonb_build_object('route',route,'points',pts)) returning * into g;
  for i in 1..46 loop
   pt:=pts->((i-1)%jsonb_array_length(pts));
   insert into public.items(game_id,item_type,item_name,item_description,value_sestertius,latitude,longitude)
   values(g.id,case when i<=6 then 'ring' else 'gem' end,case when i<=6 then ring_names[i] else 'Drágakő '||(i-6) end,
    case when i<=6 then 'Különleges gyűrű; képessége díszítő jellegű.' else 'Gyűjthető drágakő' end,case when i<=6 then 1000 else 1000*(i-6) end,(pt->>0)::float8,(pt->>1)::float8);
  end loop;
  insert into public.game_results(game_id,player_id) select g.id,id from public.players;
 elsif p_action in ('start','finish') then
  if not me.is_admin or g.id is null then raise exception 'Csak admin, létező játékban.'; end if;
  if p_action='start' then
   if g.status<>'preparation' then raise exception 'Már elindult vagy lezárult.'; end if;
   update public.games set status='active',started_at=now() where id=g.id returning * into g;
  else
   if g.status='finished' then raise exception 'Már lezárt játék.'; end if;
   update public.games set status='finished',finished_at=now() where id=g.id returning * into g;
  end if;
 elsif p_action='place_ring' then
  if not me.is_admin or g.id is null or g.status not in ('preparation','active') then raise exception 'Csak admin helyezhet el gyűrűt előkészített vagy aktív játékban.'; end if;
  if p_data->>'safe' is distinct from 'true' then raise exception 'A nyilvános, biztonságos helyszínt jóvá kell hagyni.'; end if;
  lat:=(p_data->>'lat')::float8; lng:=(p_data->>'lng')::float8;
  if lat is null or lng is null or not coalesce(game_private.point(jsonb_build_array(lat,lng),g.city_lat,g.city_lng),false) then raise exception 'Érvénytelen vagy a városközponttól 10 km-nél távolabbi helyszín.'; end if;
  select * into it from public.items where id=(p_data->>'item')::uuid and game_id=g.id for update;
  if not found or it.item_type<>'ring' or it.status<>'ground' then raise exception 'Csak még fel nem vett gyűrű helyezhető át.'; end if;
  update public.items set latitude=lat,longitude=lng where id=it.id;
  n:=array_position(ring_names,it.item_name)-1;
  if n is not null then update public.games set config=jsonb_set(config,array['points',n::text],jsonb_build_array(lat,lng)) where id=g.id returning * into g; end if;
  insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,me.id,'place_ring',jsonb_build_object('item',it.id,'from',jsonb_build_array(it.latitude,it.longitude),'to',jsonb_build_array(lat,lng)));
 elsif p_action='profile' then
  update public.players set avatar=jsonb_build_object('race',left(coalesce(p_data->>'race','Ember'),24),'weapon',left(coalesce(p_data->>'weapon','Kard'),24)) where id=me.id returning * into me;
 elsif p_action='stop' then
  update public.player_locations set sharing_enabled=false,active_seconds=0 where player_id=me.id;
 elsif p_action='location' then
  if g.status<>'active' or g.id is null then raise exception 'Nincs aktív játék.'; end if;
  lat:=(p_data->>'lat')::float8; lng:=(p_data->>'lng')::float8; acc:=(p_data->>'accuracy')::float8;
  if lat is null or lng is null or acc is null or lat not between -90 and 90 or lng not between -180 and 180 or acc not between 0 and 50 then raise exception 'Legfeljebb 50 m pontosságú GPS szükséges.'; end if;
  if game_private.distance(lat,lng,g.city_lat,g.city_lng)>10000 then raise exception 'A játék területén kívül vagy.'; end if;
  select * into loc from public.player_locations where player_id=me.id and game_id=g.id for update;
  if found and loc.sharing_enabled and loc.updated_at>now()-interval '60 seconds' then
   dt:=least(30,greatest(0,floor(extract(epoch from now()-loc.updated_at))));
   if game_private.distance(lat,lng,loc.latitude,loc.longitude)>greatest(100,dt*8) then raise exception 'Túl nagy helyváltozás. Várj a következő GPS-mérésre.'; end if;
   update public.game_results set ring_seconds=ring_seconds+dt where game_id=g.id and player_id=me.id and exists(select 1 from public.items where game_id=g.id and owner_id=me.id and status='owned' and item_type='ring');
  end if;
  insert into public.player_locations(player_id,game_id,latitude,longitude,accuracy_m,sharing_enabled,active_seconds)
   values(me.id,g.id,lat,lng,acc,true,case when dt>0 then loc.active_seconds+dt else 0 end)
   on conflict(player_id) do update set game_id=g.id,latitude=lat,longitude=lng,accuracy_m=acc,sharing_enabled=true,updated_at=now(),
    active_seconds=case when dt>0 then loc.active_seconds+dt else 0 end,
    immune_until=case when public.player_locations.game_id=g.id then public.player_locations.immune_until else null end;
 elsif p_action not in ('state','pickup','rob','destroy','recover') then
  raise exception 'Ismeretlen művelet.';
 end if;

 if p_action in ('pickup','rob','destroy','recover') then
  if g.id is null or g.status<>'active' then raise exception 'Nincs aktív játék.'; end if;
  select * into loc from public.player_locations where player_id=me.id and game_id=g.id;
  if not found or not loc.sharing_enabled or loc.updated_at<now()-interval '30 seconds' or loc.accuracy_m>50 then raise exception 'Friss GPS szükséges.'; end if;
  select * into it from public.items where id=(p_data->>'item')::uuid and game_id=g.id for update;
  if not found then raise exception 'A tárgy nem található.'; end if;
  if p_action='pickup' then
   if it.status<>'ground' or game_private.distance(loc.latitude,loc.longitude,it.latitude,it.longitude)>50 then raise exception 'A tárgy már nincs itt, vagy 50 méternél messzebb van.'; end if;
   update public.items set owner_id=me.id,status='owned',collected_at=now() where id=it.id;
   insert into public.game_results(game_id,player_id) values(g.id,me.id) on conflict(game_id,player_id) do nothing;
   update public.game_results set gems_collected=gems_collected+case when it.item_type='gem' then 1 else 0 end,sestertius_earned=sestertius_earned+case when it.item_type='gem' then it.value_sestertius else 0 end where game_id=g.id and player_id=me.id;
  elsif p_action='destroy' then
   if it.status<>'owned' or it.owner_id<>me.id or it.item_type<>'ring' or game_private.distance(loc.latitude,loc.longitude,g.mordor_lat,g.mordor_lng)>50 then raise exception 'Saját gyűrűvel, Mordor 50 méteres körzetében lehet megsemmisíteni.'; end if;
   update public.items set status='destroyed',owner_id=null,destroyed_at=now() where id=it.id;
   update public.game_results set rings_destroyed=rings_destroyed+1,sestertius_earned=sestertius_earned+1000 where game_id=g.id and player_id=me.id;
  elsif p_action='rob' then
   if it.status<>'owned' or it.owner_id=me.id then raise exception 'Más játékos saját tárgya szükséges.'; end if;
   select * into victim from public.player_locations where player_id=it.owner_id and game_id=g.id;
   if not found or not victim.sharing_enabled or victim.updated_at<now()-interval '30 seconds' or victim.accuracy_m>50 or game_private.distance(loc.latitude,loc.longitude,victim.latitude,victim.longitude)>100 then raise exception 'A másik játékos nem látható 100 méteren belül.'; end if;
   if exists(select 1 from public.robberies where game_id=g.id and ((robber_id=me.id and victim_id=it.owner_id) or (victim_id=me.id and robber_id=it.owner_id)) and created_at>now()-interval '15 minutes') then raise exception 'E két játékos között 15 perc védettség van.'; end if;
   insert into public.robberies(game_id,robber_id,victim_id,item_id,item_type) values(g.id,me.id,it.owner_id,it.id,it.item_type);
   update public.items set owner_id=me.id,collected_at=now() where id=it.id;
   insert into public.game_results(game_id,player_id) values(g.id,me.id) on conflict(game_id,player_id) do nothing;
   update public.game_results set successful_robberies=successful_robberies+1 where game_id=g.id and player_id=me.id;
  else
   s:=game_private.sauron(g);
   if it.status<>'sauron' or not exists(select 1 from game_private.ring_custody where item_id=it.id and player_id=me.id) or game_private.distance(loc.latitude,loc.longitude,(s->>0)::float8,(s->>1)::float8)>1000 then raise exception 'Csak a korábbi tulajdonos szerezheti vissza 1 km-en belül.'; end if;
   update public.items set status='owned',owner_id=me.id,collected_at=now() where id=it.id;
   delete from game_private.ring_custody where item_id=it.id;
   update public.player_locations set immune_until=now()+interval '15 minutes' where player_id=me.id;
  end if;
  insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,me.id,p_action,jsonb_build_object('item',it.id));
 end if;

 -- Tick only considers recent, explicitly shared positions; stale/offline players are never caught.
 if g.status='active' then
  s:=game_private.sauron(g);
  if g.started_at < now()-interval '30 minutes' and coalesce(g.sauron_cooldown_until,'-infinity')<=now() then
   select p.* into other from public.players p join public.player_locations l on l.player_id=p.id
    where l.game_id=g.id and l.sharing_enabled and l.active_seconds>=900 and l.updated_at>now()-interval '30 seconds'
     and coalesce(l.immune_until,'-infinity')<=now()
     and game_private.distance(l.latitude,l.longitude,(s->>0)::float8,(s->>1)::float8)<=50
     and exists(select 1 from public.items where game_id=g.id and owner_id=p.id and item_type='ring' and status='owned')
    order by p.created_at limit 1;
   if found then
    select * into it from public.items where game_id=g.id and owner_id=other.id and status='owned' and item_type='ring' order by id limit 1;
    insert into game_private.ring_custody(item_id,player_id) values(it.id,other.id) on conflict(item_id) do update set player_id=other.id;
    update public.items set owner_id=null,status='sauron' where id=it.id;
    update public.games set sauron_cooldown_until=now()+interval '60 minutes' where id=g.id returning * into g;
    insert into public.game_events(game_id,player_id,event_type,event_data) values(g.id,other.id,'sauron',jsonb_build_object('item',it.id));
   end if;
  end if;
  if not exists(select 1 from public.items where game_id=g.id and item_type='ring' and status not in ('destroyed','sauron')) then
   update public.games set status='finished',finished_at=now() where id=g.id returning * into g;
  end if;
 end if;
 if g.status='finished' and g.winner_id is null then
  select player_id into v_id from public.game_results where game_id=g.id order by sestertius_earned desc,rings_destroyed desc,ring_seconds desc,player_id limit 1;
  update public.games set winner_id=v_id where id=g.id returning * into g;
 end if;
 return jsonb_build_object(
  'me',jsonb_build_object('id',me.id,'character_name',me.character_name,'is_admin',me.is_admin,'avatar',me.avatar),
  'game',case when g.id is null then null else to_jsonb(g) end,
  'players',coalesce((select jsonb_agg(jsonb_build_object('id',id,'character_name',character_name,'avatar',avatar)) from public.players),'[]'),
  'items',coalesce((select jsonb_agg(to_jsonb(x)) from (select id,item_type,item_name,item_description,status,owner_id,latitude,longitude,value_sestertius from public.items where game_id=g.id)x),'[]'),
  'locations',coalesce((select jsonb_agg(to_jsonb(x)) from (select player_id,latitude,longitude,accuracy_m,updated_at,active_seconds from public.player_locations where game_id=g.id and sharing_enabled and updated_at>now()-interval '30 seconds')x),'[]'),
  'results',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from public.game_results where game_id=g.id order by sestertius_earned desc,ring_seconds desc)x),'[]'),
  'archive',coalesce((select jsonb_agg(to_jsonb(x)) from (select id,city_name,finished_at,winner_id from public.games where status='finished' order by created_at desc limit 20)x),'[]'),
  'events',coalesce((select jsonb_agg(to_jsonb(x)) from (select player_id,event_type,event_data,created_at from public.game_events where game_id=g.id order by created_at desc limit 30)x),'[]'),
  'sauron',case when g.id is not null and coalesce(g.sauron_cooldown_until,'-infinity')<=now() then game_private.sauron(g) else null end,
  'recoverable',coalesce((select jsonb_agg(item_id) from game_private.ring_custody where player_id=me.id),'[]'),
  'server_time',now());
end $$;
