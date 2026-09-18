import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateCategory, getCategoryBySlug } from '@/lib/data' // wait, getCategoryById is missing, I need it. Let's check if it exists in data.ts. It doesn't. I'll need to create it or just update blindly. Actually, we can just update.
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Helper function to make URLs foolproof for non-technical clients
function optimizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return url
  
  // Cloudinary auto-optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If the client didn't already include the optimization flags, inject them
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/')
    }
  }
  
  // Unsplash auto-optimization
  if (url.includes('images.unsplash.com') && !url.includes('auto=')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}auto=format&fit=crop&w=600&q=80`
  }
  
  return url
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await props.params
  const catId = parseInt(id, 10)
  if (isNaN(catId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = (await req.json()) as { name?: string; description?: string; imageUrl?: string }
    
    // Automatically optimize the image URL before saving it to the database!
    if (body.imageUrl) {
      body.imageUrl = optimizeImageUrl(body.imageUrl)
    }

    await updateCategory(catId, body)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Update category error:', err)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}
