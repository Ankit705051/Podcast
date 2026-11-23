import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Neon (and other serverless Postgres) drops idle connections. Without an
// 'error' listener, pg-pool surfaces each dead idle client as an unhandled
// error — sometimes crashing an in-flight request. Log and discard instead;
// the pool hands out fresh connections on the next query.
pool.on("error", (err) => {
  console.error("Postgres pool idle client error:", err.message);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});