import { and, desc, eq, like, ne, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts, categories, orderItems, orders, products, stores, users, wishlist } from '@/lib/db/schema'
import type { BlogPost, Category, DashboardStats, Order, OrderStatus, Product, Store, UserProfile, WishlistItem } from '@/types'

// ── Internal row -> app-type mappers ───────────────────────────────────────

type ProductRow = typeof products.$inferSelect
type CategoryRow = typeof categories.$inferSelect

function toProduct(row: ProductRow, category: CategoryRow): Product {
  let imageUrls: string[] = []
  try {
    const parsed: unknown = JSON.parse(row.imageUrls)
    if (Array.isArray(parsed)) imageUrls = parsed.filter((u): u is string => typeof u === 'string')
  } catch {
    // Malformed JSON in the DB shouldn't crash a page render — fall back to no images.
    imageUrls = []
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    stock: row.stock,
    imageUrls,
    videoUrl: row.videoUrl,
    categoryId: row.categoryId,
    categorySlug: category.slug,
    categoryName: category.name,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
  }
}

function toCategory(row: CategoryRow): Category {
  return { id: row.id, slug: row.slug, name: row.name, description: row.description, imageUrl: row.imageUrl }
}

function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : []
  } catch {
    return []
  }
}

type OrderRow = typeof orders.$inferSelect
type OrderItemRow = typeof orderItems.$inferSelect

function toOrder(row: OrderRow, itemRows: OrderItemRow[]): Order {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    paymentMethod: row.paymentMethod,
    name: row.name,
    email: row.email,
    phone: row.phone,
    shippingAddress: row.shippingAddress,
    notes: row.notes,
    subtotal: row.subtotal,
    total: row.total,
    pointsEarned: row.pointsEarned,
    createdAt: row.createdAt,
    items: itemRows.map(i => ({
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      price: i.price,
      quantity: i.quantity,
    })),
  }
}

// ── Categories ──────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const rows = await db.select().from(categories).orderBy(categories.sortOrder)
  return rows.map(toCategory)
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug))
  return row ? toCategory(row) : undefined
}

// ── Products ────────────────────────────────────────────────────────────

interface GetProductsOptions {
  featured?: boolean
  isNew?: boolean
  categorySlug?: string
  limit?: number
  sort?: string
  inStock?: boolean
}

export async function getProducts(opts: GetProductsOptions = {}): Promise<Product[]> {
  const conditions = []
  if (opts.featured) conditions.push(eq(products.isFeatured, true))
  if (opts.isNew) conditions.push(eq(products.isNew, true))
  
  if (opts.inStock) {
    conditions.push(sql`${products.stock} > 0`)
  }

  let categoryId: number | undefined
  if (opts.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug)
    if (!cat) return []
    categoryId = cat.id
    conditions.push(eq(products.categoryId, cat.id))
  }
  void categoryId

  const query = db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      opts.sort === 'price-asc' ? sql`${products.price} ASC` :
      opts.sort === 'price-desc' ? desc(products.price) :
      desc(products.createdAt)
    )

  const rows = opts.limit ? await query.limit(opts.limit) : await query
  return rows.map(r => toProduct(r.product, r.category))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [row] = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
  return row ? toProduct(row.product, row.category) : null
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.categoryId, product.categoryId), ne(products.id, product.id)))
    .limit(limit)
  return rows.map(r => toProduct(r.product, r.category))
}

export async function searchProducts(query: string, limit = 5): Promise<Product[]> {
  const term = `%${query.trim()}%`
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(or(like(products.name, term), like(products.description, term)))
    .limit(limit)
  return rows.map(r => toProduct(r.product, r.category))
}

// ── Blog ────────────────────────────────────────────────────────────────

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const query = db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt))
  const rows = limit ? await query.limit(limit) : await query
  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.imageUrl,
    tags: parseTags(row.tags),
    createdAt: row.createdAt,
  }))
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug))
  if (!row) return undefined
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.imageUrl,
    tags: parseTags(row.tags),
    createdAt: row.createdAt,
  }
}

// ── Stores ──────────────────────────────────────────────────────────────

export async function getStores(): Promise<Store[]> {
  const rows = await db.select().from(stores)
  return rows.map(row => ({ id: row.id, name: row.name, address: row.address, hours: row.hours, phone: row.phone }))
}

// ── Users ───────────────────────────────────────────────────────────────

export async function getUserById(id: number): Promise<UserProfile | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id))
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    loyaltyPoints: row.loyaltyPoints,
    referralCode: row.referralCode,
    role: row.role,
  }
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const orderRows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
  const results: Order[] = []
  for (const order of orderRows) {
    const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    results.push(toOrder(order, itemRows))
  }
  return results
}

// ── Admin — orders ──────────────────────────────────────────────────────
// No pagination yet: fine at this catalog's order volume, revisit if the
// admin orders list ever needs to handle thousands of rows.

export async function getAllOrders(status?: OrderStatus): Promise<Order[]> {
  const orderRows = status
    ? await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt))
    : await db.select().from(orders).orderBy(desc(orders.createdAt))

  const results: Order[] = []
  for (const order of orderRows) {
    const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    results.push(toOrder(order, itemRows))
  }
  return results
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id))
  if (!order) return undefined
  const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return toOrder(order, itemRows)
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  await db.update(orders).set({ status }).where(eq(orders.id, id))
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt))
  const customerCountRows = await db.select({ count: sql<number>`count(*)` }).from(users)
  const totalCustomers = customerCountRows[0]?.count ?? 0

  const recentOrderRows = allOrders.slice(0, 5)
  const recentOrders: Order[] = []
  for (const order of recentOrderRows) {
    const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    recentOrders.push(toOrder(order, itemRows))
  }

  return {
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
    pendingOrders: allOrders.filter(o => o.status === 'pending').length,
    totalCustomers,
    recentOrders,
  }
}

// ── Wishlist ────────────────────────────────────────────────────────────

export async function getUserWishlist(userId: number): Promise<WishlistItem[]> {
  const rows = await db
    .select({ wishlistId: wishlist.id, product: products, category: categories })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(wishlist.userId, userId))
    .orderBy(desc(wishlist.createdAt))

  return rows.map(r => ({ id: r.wishlistId, product: toProduct(r.product, r.category) }))
}

export async function addToWishlist(userId: number, productId: number): Promise<void> {
  const [existing] = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
  if (existing) return // idempotent — already wishlisted
  await db.insert(wishlist).values({ userId, productId })
}

export async function removeFromWishlist(userId: number, productId: number): Promise<void> {
  await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
}

// ── Admin — products ─────────────────────────────────────────────────────

export async function getAllProductsAdmin(): Promise<Product[]> {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt))
  return rows.map(r => toProduct(r.product, r.category))
}

export async function getProductById(id: number): Promise<Product | null> {
  const [row] = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
  return row ? toProduct(row.product, row.category) : null
}

export interface ProductInput {
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  stock: number
  imageUrls: string[]
  videoUrl: string | null
  categoryId: number
  isNew: boolean
  isFeatured: boolean
}

export async function createProduct(data: ProductInput): Promise<number> {
  const [row] = await db.insert(products).values({
    ...data,
    imageUrls: JSON.stringify(data.imageUrls),
  }).returning()
  return row!.id
}

export async function updateProduct(id: number, data: Partial<ProductInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...data }
  if (data.imageUrls !== undefined) patch.imageUrls = JSON.stringify(data.imageUrls)
  await db.update(products).set(patch).where(eq(products.id, id))
}

export async function deleteProduct(id: number): Promise<void> {
  await db.delete(products).where(eq(products.id, id))
}

// ── Admin — blog ─────────────────────────────────────────────────────────

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt))
  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.imageUrl,
    tags: parseTags(row.tags),
    createdAt: row.createdAt,
  }))
}

export async function getBlogPostById(id: number): Promise<BlogPost | undefined> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id))
  if (!row) return undefined
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.imageUrl,
    tags: parseTags(row.tags),
    createdAt: row.createdAt,
  }
}

export interface BlogPostInput {
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string | null
  tags: string[]
}

export async function createBlogPost(data: BlogPostInput): Promise<number> {
  const [row] = await db.insert(blogPosts).values({
    ...data,
    tags: JSON.stringify(data.tags),
  }).returning()
  return row!.id
}

export async function updateBlogPost(id: number, data: Partial<BlogPostInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...data }
  if (data.tags !== undefined) patch.tags = JSON.stringify(data.tags)
  await db.update(blogPosts).set(patch).where(eq(blogPosts.id, id))
}

export async function deleteBlogPost(id: number): Promise<void> {
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
}

// ── Admin — stores ───────────────────────────────────────────────────────

export async function createStore(data: { name: string; address: string; hours: string; phone: string | null }): Promise<number> {
  const [row] = await db.insert(stores).values(data).returning()
  return row!.id
}

export async function updateStore(id: number, data: Partial<{ name: string; address: string; hours: string; phone: string | null }>): Promise<void> {
  await db.update(stores).set(data).where(eq(stores.id, id))
}

export async function deleteStore(id: number): Promise<void> {
  await db.delete(stores).where(eq(stores.id, id))
}
