import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// drizzle-kit executes from the package directory; explicitly load repo-root env.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost:5432/adscrush",    
  },
  verbose: true,
  strict: true,
});
