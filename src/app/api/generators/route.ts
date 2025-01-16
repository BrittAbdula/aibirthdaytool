import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { GeneratorFormData } from '@/lib/types/generator'

export async function POST(req: Request) {
  try {
    console.log('Request received:', req)
    const session = await auth()
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const data = await req.json() as GeneratorFormData
    console.log("---------------------------------data: ")
    console.log(data)
    data.slug = data.name.toLowerCase().replace(/\s+/g, '-')
    data.title = data.name + ' Generator'
    data.label = data.name
    data.name = data.title
    // Validate required fields
    const requiredFields = ['name', 'slug', 'title', 'label', 'fields']
    const missingFields = requiredFields.filter(field => !data[field as keyof GeneratorFormData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Check for slug uniqueness
    const existing = await prisma.cardGenerator.findUnique({
      where: { slug: data.slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A generator with this slug already exists' },
        { status: 400 }
      )
    }

    const generator = await prisma.cardGenerator.create({
      data: {
        ...data,
        // Serialize JSON fields
        fields: JSON.parse(JSON.stringify(data.fields)),
        advancedFields: data.advancedFields ? JSON.parse(JSON.stringify(data.advancedFields)) : undefined,
        why: data.why ? JSON.parse(JSON.stringify(data.why)) : undefined,
        userId: session?.user?.id,
        isPublic: true
      }
    })

    return NextResponse.json(generator)
  } catch (error) {
    console.error('Error creating generator:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}