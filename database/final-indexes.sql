-- Applied after the initial upgrade on the existing project.
drop index public.players_auth_unique;
create index invites_used_by_idx on game_private.invites(used_by);
create index ring_custody_player_idx on game_private.ring_custody(player_id);
