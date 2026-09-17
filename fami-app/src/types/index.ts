export interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  imageUrl: string | null
}

// Flattened product shape: category info is joined in at the data-access
// layer so components never need a separate category lookup.
export interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  stock: number
  imageUrls: string[]
  videoUrl: string | null
  categoryId: number
  categorySlug: string
  categoryName: string
  isNew: boolean
  isFeatured: boolean
}

export type PaymentMethod = 'cod' | 'whatsapp' | 'bkash' | 'nagad' | 'sslcommerz'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderLineItem {
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
}

export interface Order {
  id: number
  userId: number | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  name: string
  email: string
  phone: string
  shippingAddress: string
  notes: string | null
  subtotal: number
  total: number
  pointsEarned: number
  createdAt: Date
  items: OrderLineItem[]
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalCustomers: number
  recentOrders: Order[]
}

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  loyaltyPoints: number
  referralCode: string
  role: 'customer' | 'admin'
}

export interface WishlistItem {
  id: number
  product: Product
}

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
  tags: string[]
  createdAt: Date
}

export interface Store {
  id: number
  name: string
  address: string
  hours: string
  phone: string | null
}

export interface CartItem {
  productId: number
  slug: string
  name: string
  price: number
  imageUrl: string
  stock: number
  quantity: number
}
