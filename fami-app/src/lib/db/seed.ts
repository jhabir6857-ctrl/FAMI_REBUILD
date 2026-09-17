import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) throw new Error('No DB URL');

const sql = neon(connectionString)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('Seeding database...')

  const existing = await db.select().from(schema.categories)
  if (existing.length > 0) {
    console.log('Already seeded - skipping.')
    return
  }

  const categoryDefs = [
    { slug: 'rings', name: 'Rings', description: 'Statement and everyday rings' },
    { slug: 'necklaces', name: 'Necklaces', description: 'Chains, pendants and layering pieces' },
    { slug: 'earrings', name: 'Earrings', description: 'Studs, hoops and drops' },
    { slug: 'bracelets', name: 'Bracelets', description: 'Bangles, cuffs and chain bracelets' },
    { slug: 'handbags', name: 'Handbags', description: 'Everyday and occasion bags' },
    { slug: 'crossbody-bags', name: 'Crossbody bags', description: 'Compact bags for daily wear' },
    { slug: 'dresses', name: 'Dresses', description: 'Occasion and everyday dresses' },
    { slug: 'skincare', name: 'Skincare', description: 'Cleansers, serums and moisturisers' },
    { slug: 'gift-sets', name: 'Gift sets', description: 'Curated gifting bundles' },
  ]
  const insertedCategories = await db.insert(schema.categories).values(categoryDefs).returning()
  const catId = (slug: string) => insertedCategories.find(c => c.slug === slug)!.id

  const productDefs = [
    { slug: 'rose-gold-solitaire-ring', name: 'Rose Gold Solitaire Ring', description: 'A single cubic zirconia set in a delicate rose gold band.', price: 2450, stock: 14, category: 'rings', isFeatured: true },
    { slug: 'twist-band-ring', name: 'Twist Band Ring', description: 'Interwoven band in warm gold tone.', price: 1650, stock: 20, category: 'rings' },
    { slug: 'stacking-ring-set', name: 'Stacking Ring Set (3pc)', description: 'Three slim bands designed to mix and match.', price: 2100, compareAtPrice: 2800, stock: 9, category: 'rings', isNew: true },
    { slug: 'layered-pendant-necklace', name: 'Layered Pendant Necklace', description: 'Two-tier chain with a petite disc pendant.', price: 2900, stock: 11, category: 'necklaces', isFeatured: true },
    { slug: 'pearl-drop-necklace', name: 'Pearl Drop Necklace', description: 'Single freshwater pearl on a fine chain.', price: 3200, stock: 7, category: 'necklaces' },
    { slug: 'chain-choker', name: 'Chain Choker', description: 'Close-fit chain choker, adjustable clasp.', price: 1800, stock: 16, category: 'necklaces', isNew: true },
    { slug: 'huggie-hoop-earrings', name: 'Huggie Hoop Earrings', description: 'Everyday hoops that hug the earlobe.', price: 1400, stock: 25, category: 'earrings', isFeatured: true },
    { slug: 'crystal-stud-earrings', name: 'Crystal Stud Earrings', description: 'Round-cut studs with secure backs.', price: 1200, compareAtPrice: 1600, stock: 30, category: 'earrings' },
    { slug: 'threader-earrings', name: 'Threader Earrings', description: 'Fine chain threaders for a modern drape.', price: 1550, stock: 12, category: 'earrings', isNew: true },
    { slug: 'chain-link-bracelet', name: 'Chain Link Bracelet', description: 'Chunky chain-link bracelet, lobster clasp.', price: 2000, stock: 13, category: 'bracelets' },
    { slug: 'beaded-stretch-bracelet', name: 'Beaded Stretch Bracelet', description: 'Semi-precious stone beads on stretch cord.', price: 950, stock: 22, category: 'bracelets' },
    { slug: 'structured-tote', name: 'Structured Tote', description: 'Everyday tote with an internal zip pocket.', price: 4200, stock: 8, category: 'handbags', isFeatured: true },
    { slug: 'quilted-shoulder-bag', name: 'Quilted Shoulder Bag', description: 'Quilted texture with a chain strap.', price: 4800, compareAtPrice: 5600, stock: 6, category: 'handbags' },
    { slug: 'mini-crossbody', name: 'Mini Crossbody', description: 'Compact crossbody for cards, phone and keys.', price: 2600, stock: 17, category: 'crossbody-bags', isNew: true },
    { slug: 'woven-crossbody', name: 'Woven Crossbody', description: 'Textured weave with an adjustable strap.', price: 2900, stock: 10, category: 'crossbody-bags' },
    { slug: 'wrap-midi-dress', name: 'Wrap Midi Dress', description: 'Flattering wrap silhouette in soft crepe.', price: 3600, stock: 9, category: 'dresses', isFeatured: true },
    { slug: 'linen-shirt-dress', name: 'Linen Shirt Dress', description: 'Breathable linen-blend, relaxed fit.', price: 3100, stock: 12, category: 'dresses' },
    { slug: 'vitamin-c-serum', name: 'Vitamin C Brightening Serum', description: '15% vitamin C serum for an even tone.', price: 1850, stock: 24, category: 'skincare', isFeatured: true },
    { slug: 'hydrating-gift-set', name: 'Hydrating Skincare Gift Set', description: 'Cleanser, serum and moisturiser in a gift box.', price: 3400, compareAtPrice: 4200, stock: 15, category: 'gift-sets', isNew: true },
  ]

  const insertedProducts = await db.insert(schema.products).values(
    productDefs.map(p => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stock: p.stock,
      imageUrls: JSON.stringify([]),
      categoryId: catId(p.category),
      isNew: p.isNew ?? false,
      isFeatured: p.isFeatured ?? false,
    }))
  ).returning()
  
  await db.insert(schema.stores).values([
    { name: 'FaMi - Gulshan', address: 'House 12, Road 103, Gulshan 2, Dhaka', hours: 'Sat-Thu, 11am-8pm', phone: '+8801700000000' },
    { name: 'FaMi - Dhanmondi', address: 'Road 27, Dhanmondi, Dhaka', hours: 'Sat-Thu, 11am-8pm', phone: '+8801700000001' },
  ])

  const demoPasswordHash = await bcrypt.hash('password123', 10)
  await db.insert(schema.users).values([
    { name: 'Admin', email: 'admin@famibd.shop', passwordHash: demoPasswordHash, referralCode: 'FAMI-ADMN0001', role: 'admin' },
    { name: 'Demo Customer', email: 'customer@famibd.shop', passwordHash: demoPasswordHash, referralCode: 'FAMI-DEMO0001', role: 'customer' },
  ])

  console.log('Seed complete!')
}

seed().catch(console.error)
