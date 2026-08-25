import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// ── Categories ──────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ── Products ────────────────────────────────────────────────
// price / compareAtPrice are stored as whole BDT taka (integers) — no paisa precision needed for this catalog.
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  price: integer('price').notNull(),
  compareAtPrice: integer('compare_at_price'),
  stock: integer('stock').notNull().default(0),
  // JSON-encoded string array, e.g. '["https://res.cloudinary.com/.../a.jpg"]'
  imageUrls: text('image_urls').notNull().default('[]'),
  // Optional PDP gallery clip — Cloudinary hosted, 9:16, 3-5s, muted loop.
  // Strictly optional: absence must never produce a broken gallery slot.
  videoUrl: text('video_url'),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  isNew: integer('is_new', { mode: 'boolean' }).notNull().default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}))

// ── Users ───────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  address: text('address'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  referralCode: text('referral_code').notNull().unique(),
  // Admin role assignment (Phase 3 gap-fill): seed one hardcoded admin,
  // promote others later with `UPDATE users SET role = 'admin' WHERE email = '...'`.
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

// ── Orders ──────────────────────────────────────────────────
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  paymentMethod: text('payment_method', { enum: ['cod', 'whatsapp', 'bkash', 'nagad'] }).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] })
    .notNull()
    .default('pending'),
  subtotal: integer('subtotal').notNull(),
  total: integer('total').notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  // Denormalized on purpose: order history must stay accurate even if the
  // product is later renamed, re-priced, or deleted.
  productName: text('product_name').notNull(),
  productImage: text('product_image').notNull().default(''),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
})

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}))
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}))

// ── Wishlist ────────────────────────────────────────────────
export const wishlist = sqliteTable('wishlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

// ── Blog ────────────────────────────────────────────────────
export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: text('content').notNull().default(''),
  imageUrl: text('image_url'),
  // JSON-encoded string array — kept simple, no separate tags table needed at this scale.
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

// ── Store locations ─────────────────────────────────────────
export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  hours: text('hours').notNull().default(''),
  phone: text('phone'),
})
