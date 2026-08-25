import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database(process.env.DATABASE_URL ?? './fami.db')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite, { schema })

function createTables() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      compare_at_price INTEGER,
      stock INTEGER NOT NULL DEFAULT 0,
      image_urls TEXT NOT NULL DEFAULT '[]',
      video_url TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      is_new INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal INTEGER NOT NULL,
      total INTEGER NOT NULL,
      points_earned INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_image TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    );
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      hours TEXT NOT NULL DEFAULT '',
      phone TEXT
    );
  `)
}

async function seed() {
  createTables()

  // Idempotent: skip if already seeded.
  const existing = db.select().from(schema.categories).all()
  if (existing.length > 0) {
    console.log('Already seeded — skipping. Delete fami.db to reseed from scratch.')
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
  const insertedCategories = db.insert(schema.categories).values(categoryDefs).returning().all()
  const catId = (slug: string) => insertedCategories.find(c => c.slug === slug)!.id

  const productDefs: Array<{
    slug: string; name: string; description: string; price: number; compareAtPrice?: number
    stock: number; category: string; isNew?: boolean; isFeatured?: boolean
  }> = [
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

  const insertedProducts = db.insert(schema.products).values(
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
  ).returning().all()
  console.log(`Seeded ${insertedProducts.length} products across ${insertedCategories.length} categories.`)

  db.insert(schema.blogPosts).values([
    {
      slug: 'how-to-layer-necklaces',
      title: 'How to layer necklaces without the tangle',
      excerpt: 'Three rules for a layered look that stays put through a full day.',
      content: '<p>Start with your shortest chain closest to the neck, vary pendant sizes, and use different chain textures so links don\u2019t catch on each other.</p>',
      tags: JSON.stringify(['guides', 'jewellery']),
    },
    {
      slug: 'caring-for-rose-gold',
      title: 'Caring for rose gold-plated pieces',
      excerpt: 'Simple habits that keep the finish looking new for years.',
      content: '<p>Remove jewellery before showering or applying perfume, store pieces separately to avoid scratching, and wipe with a soft cloth after wear.</p>',
      tags: JSON.stringify(['care-guides']),
    },
    {
      slug: 'building-a-capsule-bag-rotation',
      title: 'Building a capsule bag rotation',
      excerpt: 'Three bags that cover every occasion without the clutter.',
      content: '<p>One structured tote for work, one crossbody for errands, and one evening bag for occasions covers most weeks without overbuying.</p>',
      tags: JSON.stringify(['guides', 'bags']),
    },
  ]).run()

  db.insert(schema.stores).values([
    { name: 'FaMi — Gulshan', address: 'House 12, Road 103, Gulshan 2, Dhaka', hours: 'Sat–Thu, 11am–8pm', phone: '+8801700000000' },
    { name: 'FaMi — Dhanmondi', address: 'Road 27, Dhanmondi, Dhaka', hours: 'Sat–Thu, 11am–8pm', phone: '+8801700000001' },
  ]).run()

  const demoPasswordHash = await bcrypt.hash('password123', 10)
  db.insert(schema.users).values([
    { name: 'Admin', email: 'admin@famibd.shop', passwordHash: demoPasswordHash, referralCode: 'FAMI-ADMN0001', role: 'admin' },
    { name: 'Demo Customer', email: 'customer@famibd.shop', passwordHash: demoPasswordHash, referralCode: 'FAMI-DEMO0001', role: 'customer' },
  ]).run()

  console.log('Seed complete. Demo accounts (password: "password123"):')
  console.log('  admin@famibd.shop    (role: admin)')
  console.log('  customer@famibd.shop (role: customer)')
}

seed()
  .then(() => sqlite.close())
  .catch(err => {
    console.error(err)
    sqlite.close()
    process.exit(1)
  })
