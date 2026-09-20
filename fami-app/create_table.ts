import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at timestamp DEFAULT now() NOT NULL
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS wishlist_user_product_idx ON wishlist(user_id, product_id);
    `;
    console.log('Wishlist table created successfully');
  } catch (e) {
    console.error(e);
  }
}

run();
