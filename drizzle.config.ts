import { defineConfig } from "drizzle-kit";
import { dbCredentials } from "./core/database/config";

export default defineConfig({
  out: "./core/database/drizzle",
  schema: "./core/database/schema.ts",
  dialect: "postgresql",
  dbCredentials,
});
