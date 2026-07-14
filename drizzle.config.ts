import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Migrations must use the direct (unpooled) connection string.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  // The neon_auth schema is provisioned and owned by Neon Auth — never
  // let drizzle-kit try to manage it.
  schemaFilter: ["public"],
});
