import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 1. Create a standard PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Wrap the pool in the new Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client with the mandatory adapter
const prisma = new PrismaClient({ adapter });

// Export it so other files can use this exact same connection
export default prisma;