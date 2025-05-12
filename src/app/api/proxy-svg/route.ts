import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch SVG: ${response.statusText}` }, 
        { status: response.status }
      )
    }

    const svgContent = await response.text()
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching SVG:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SVG content' }, 
      { status: 500 }
    )
  }
} 