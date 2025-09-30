import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const apiKey = process.env.KIE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, code: 500, msg: 'KIE_API_KEY not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadPath = (formData.get('uploadPath') as string) || 'images/user-uploads'
    const fileName = (formData.get('fileName') as string) || undefined

    if (!file) {
      return NextResponse.json({ success: false, code: 400, msg: 'Missing file' }, { status: 400 })
    }

    const upstreamForm = new FormData()
    upstreamForm.append('file', file, (file as any).name || fileName || 'upload.jpg')
    upstreamForm.append('uploadPath', uploadPath)
    if (fileName) upstreamForm.append('fileName', fileName)

    const resp = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: upstreamForm
    })

    const data = await resp.json()
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Reference upload error:', err)
    return NextResponse.json({ success: false, code: 500, msg: 'Internal server error' }, { status: 500 })
  }
}

