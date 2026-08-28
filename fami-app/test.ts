import { db } from './src/lib/db'
import { products } from './src/lib/db/schema'

async function main() {
  const p = await db.select().from(products).limit(1)
  console.log(p)
  process.exit(0)
}
main()
