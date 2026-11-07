-- Public registration still creates ordinary players only. Admin rights stay owner-managed.
create function public.game_register_open(p_name text,p_pin text,p_auth_user_id uuid,p_avatar jsonb default '{}')
returns uuid language plpgsql security definer set search_path='' as $$
declare pid uuid;
begin
 perform pg_catalog.pg_advisory_xact_lock(987654321);
 pid:=public.game_register_player(btrim(p_name),p_pin,p_auth_user_id);
 update public.players set is_admin=false,avatar=jsonb_build_object('race',left(coalesce(p_avatar->>'race','Ember'),24),'weapon',left(coalesce(p_avatar->>'weapon','Kard'),24)) where id=pid;
 return pid;
end $$;
revoke all on function public.game_register_open(text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.game_register_open(text,text,uuid,jsonb) to service_role;
revoke execute on function public.game_register_invited(text,text,uuid,text,jsonb),public.game_invite_valid(text) from service_role;
update game_private.invites set expires_at=now() where used_by is null;
