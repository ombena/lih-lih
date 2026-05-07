import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

/**
 * Global Prisma Client
 * Configured for the entire backend.
 */
const prisma = new PrismaClient();

export default prisma;