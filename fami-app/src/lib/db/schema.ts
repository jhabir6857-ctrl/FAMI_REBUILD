import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ── Categories ────────────────────────────────────────────────────────────
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ── Products ──────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  price: integer('price').notNull(),
  compareAtPrice: integer('compare_at_price'),
  stock: integer('stock').notNull().default(0),
  imageUrls: text('image_urls').notNull().default('[]'),
  videoUrl: text('video_url'),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  isNew: boolean('is_new').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}))

// ── Users ─────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  address: text('address'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  referralCode: text('referral_code').notNull().unique(),
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Orders ────────────────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  paymentMethod: text('payment_method', { enum: ['cod', 'whatsapp', 'bkash', 'nagad', 'sslcommerz'] }).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] })
    .notNull()
    .default('pending'),
  subtotal: integer('subtotal').notNull(),
  total: integer('total').notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  notes: text('notes'),
  tranId: text('tran_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
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

// ── Wishlist ──────────────────────────────────────────────────────────────
export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Blog ──────────────────────────────────────────────────────────────────
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: text('content').notNull().default(''),
  imageUrl: text('image_url'),
  tags: text('tags').notNull().default('[]'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ── Store locations ───────────────────────────────────────────────────────
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  hours: text('hours').notNull().default(''),
  phone: text('phone'),
})

// ── Rate Limits ───────────────────────────────────────────────────────────
export const rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  key: text('key').notNull(),
  timestamp: integer('timestamp').notNull(),
})

// ———————————————— Settings ————————————————
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  deliveryChargeInside: integer('delivery_charge_inside').notNull().default(80),
  deliveryChargeOutside: integer('delivery_charge_outside').notNull().default(150),
  freeShippingThreshold: integer('free_shipping_threshold').notNull().default(5000),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
