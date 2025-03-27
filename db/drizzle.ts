import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Type for our database instance
export type Database = ReturnType<typeof drizzle<typeof schema>>;

export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });