// Runs drizzle/seed.sql (idempotent) against the direct Neon connection.
// Used by `npm run db:seed` and the Vercel build (`npm run vercel-build`).
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error(
    "seed: DATABASE_URL_UNPOOLED (or DATABASE_URL) must be set — aborting.",
  );
  process.exit(1);
}

const sqlPath = fileURLToPath(new URL("../drizzle/seed.sql", import.meta.url));
const sql = await readFile(sqlPath, "utf8");

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(
    "SELECT count(*)::int AS count FROM struct_levels",
  );
  console.log(`seed: ok — ${rows[0].count} recurrence levels present.`);
} finally {
  await client.end();
}
