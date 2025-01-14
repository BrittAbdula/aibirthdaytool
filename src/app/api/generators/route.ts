import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const data = await req.json()
    
    // 验证必要字段
    if (!data.name || !data.slug || !data.fields || !data.promptContent) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // 创建生成器
    const generator = await prisma.cardGenerator.create({
      data: {
        name: data.name,
        slug: data.slug,
        title: data.title,
        label: data.label,
        description: data.description,
        fields: data.fields,
        advancedFields: data.advancedFields || undefined,
        templateInfo: data.templateInfo,
        why: data.why,
        promptContent: data.promptContent,
        isPublic: true,
        userId: session?.user?.id || null,
      },
    })

    return NextResponse.json(generator)
  } catch (error) {
    console.error('Error creating generator:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}