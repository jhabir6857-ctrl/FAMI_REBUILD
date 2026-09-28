import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/lib/db/schema';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { eq } from 'drizzle-orm';

const db = drizzle(neon(process.env.DATABASE_URL!));
async function run() {
  await db.update(schema.users).set({role: 'admin'}).where(eq(schema.users.email, 'farhanahmed20020@gmail.com'));
  console.log('Made user admin!');
}
run().catch(console.error);
