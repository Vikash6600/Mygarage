import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { storageService } from '@/services/storage'
import { LoggerService } from '@/services/logger'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const userId = session.user.id
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const path = `uploads/${fileName}`

    await storageService.uploadFile(buffer, path, file.type)
    const publicUrl = storageService.getFileUrl(path)

    return NextResponse.json({ success: true, url: publicUrl, path })
  } catch (err: any) {
    await LoggerService.error('API_UPLOAD_EXCEPTION', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
