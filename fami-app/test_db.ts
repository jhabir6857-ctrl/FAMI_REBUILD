import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  try {
    const res = await sql`SELECT 1 as connected`;
    console.log('DATABASE IS ALIVE AND CONNECTED!', res);
  } catch (e) {
    console.error('Still failing:', e);
  }
}

run();
