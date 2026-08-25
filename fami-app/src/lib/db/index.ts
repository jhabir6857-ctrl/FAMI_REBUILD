import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// Reuse a single connection across hot reloads in dev so we don't exhaust
// file handles / lock the SQLite file on every request.
declare global {
  var __famiSqlite: Database.Database | undefined
}

const sqlite = global.__famiSqlite ?? new Database(process.env.DATABASE_URL ?? './fami.db')
if (process.env.NODE_ENV !== 'production') global.__famiSqlite = sqlite

sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
