import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({
    adapter,
    log: ["error", "warn"],
});
//# sourceMappingURL=prisma.js.map