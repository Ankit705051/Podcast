import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'], // Log errors and warnings
});
//# sourceMappingURL=prisma.js.map