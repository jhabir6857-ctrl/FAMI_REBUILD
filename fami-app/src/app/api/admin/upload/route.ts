import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? 'fami_products'

  let formData: FormData
  try { formData = await req.formData() } catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }) }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 })
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 })

  // If no Cloudinary config, return a placeholder so the admin can still paste URLs manually
  if (!cloudName) {
    return NextResponse.json({ url: '' }, { status: 200 })
  }

  try {
    const uploadForm = new FormData()
    uploadForm.append('file', file)
    uploadForm.append('upload_preset', uploadPreset)
    uploadForm.append('folder', 'fami-products')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadForm,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[upload] Cloudinary error:', text)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const data = await res.json() as { secure_url: string }
    return NextResponse.json({ url: data.secure_url })
  } catch (err) {
    console.error('[upload] Failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
