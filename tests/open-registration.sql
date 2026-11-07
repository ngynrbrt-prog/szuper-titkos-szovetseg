begin;
do $$
declare uid uuid:=gen_random_uuid(); pid uuid; denied boolean:=false;
begin
 insert into auth.users(id,email) values(uid,uid||'@test.invalid');
 pid:=public.game_register_open('OpenRegistrationTest','12345678',uid,'{"is_admin":true}');
 if not exists(select 1 from public.players where id=pid and not is_admin and registration_completed) then raise exception 'Ordinary player registration failed'; end if;
 if public.game_verify_player('OpenRegistrationTest','12345678')<>uid then raise exception 'PIN login failed'; end if;
 if has_function_privilege('anon','public.game_register_open(text,text,uuid,jsonb)','EXECUTE') or has_function_privilege('authenticated','public.game_register_open(text,text,uuid,jsonb)','EXECUTE') then raise exception 'Client can invoke privileged registration directly'; end if;
end $$;
select 'PASS: no invite required; no admin escalation; PIN works; direct RPC blocked' as result;
rollback;
