import { db } from './src/lib/db'
import { categories } from './src/lib/db/schema'
import { eq } from 'drizzle-orm'

async function seedCategoryImages() {
  const defaultImages: Record<string, string> = {
    'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=400&q=80',
    'necklaces': 'https://images.unsplash.com/photo-1599643477877-530eb255b2ce?auto=format&fit=crop&w=400&q=80',
    'earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
    'bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80',
    'handbags': 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80',
    'crossbody-bags': 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=400&q=80',
    'dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
    'skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80',
    'gift-sets': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
  }

  const allCats = await db.select().from(categories)
  for (const cat of allCats) {
    const imgUrl = defaultImages[cat.slug] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'
    await db.update(categories).set({ imageUrl: imgUrl }).where(eq(categories.id, cat.id))
    console.log(`Updated ${cat.slug} with image`)
  }
  console.log('Done')
}

seedCategoryImages().catch(console.error)
