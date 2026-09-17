import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set DATABASE_URL or POSTGRES_URL.");
}

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
