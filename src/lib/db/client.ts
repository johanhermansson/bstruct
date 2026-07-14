import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";

import * as schema from "./schema";

// Vercel Fluid compute reuses function instances, so a standard TCP pool on
// the pooled (-pooler) Neon connection string is the recommended setup.
// attachDatabasePool releases idle connections before instances suspend.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
