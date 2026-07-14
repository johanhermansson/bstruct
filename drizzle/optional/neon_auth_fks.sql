-- OPTIONAL: foreign keys into the Neon Auth managed schema.
--
-- Neon Auth (managed Better Auth) owns the `neon_auth` schema; user rows live
-- in neon_auth."user". These FKs give you cascading cleanup when a user is
-- deleted. They are kept out of the drizzle journal because the provider may
-- recreate its schema across beta versions — if that happens, re-run this file.
--
-- Apply manually once Neon Auth is enabled on the database:
--   psql "$DATABASE_URL_UNPOOLED" -f drizzle/optional/neon_auth_fks.sql
--
-- The app never relies on these: every query is scoped by user_id anyway.

ALTER TABLE boards
  ADD CONSTRAINT boards_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

ALTER TABLE notes
  ADD CONSTRAINT notes_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

ALTER TABLE todo_lists
  ADD CONSTRAINT todo_lists_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

ALTER TABLE todo_items
  ADD CONSTRAINT todo_items_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

ALTER TABLE structs
  ADD CONSTRAINT structs_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

ALTER TABLE struct_items
  ADD CONSTRAINT struct_items_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;

ALTER TABLE struct_updates
  ADD CONSTRAINT struct_updates_user_fk FOREIGN KEY (user_id)
  REFERENCES neon_auth."user"(id) ON DELETE CASCADE;
