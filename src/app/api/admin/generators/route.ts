import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// 管理员用户ID
const ADMIN_USER_ID = 'cm56ic66y000110jijyw2ir8r'

// 权限检查函数
async function checkPermission() {
  const session = await auth()
  return session?.user?.id === ADMIN_USER_ID
}

// 获取所有生成器
export async function GET() {
  try {
    // 检查权限
    const isAuthorized = await checkPermission()
    
    // 如果不是管理员用户，返回未授权错误
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const generators = await prisma.cardGenerator.findMany({
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(generators)
  } catch (error) {
    console.error('Error fetching generators:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 创建新生成器
export async function POST(req: Request) {
  try {
    // 检查权限
    const isAuthorized = await checkPermission()
    
    // 如果不是管理员用户，返回未授权错误
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await req.json()
    
    // 检查必填字段
    const requiredFields = ['name', 'slug', 'title', 'label', 'promptContent']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // 检查slug唯一性
    const existing = await prisma.cardGenerator.findUnique({
      where: { slug: data.slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A generator with this slug already exists' },
        { status: 400 }
      )
    }

    // 确保JSON字段正确处理
    const generator = await prisma.cardGenerator.create({
      data: {
        ...data,
        fields: data.fields ? JSON.parse(JSON.stringify(data.fields)) : {},
        advancedFields: data.advancedFields ? JSON.parse(JSON.stringify(data.advancedFields)) : undefined,
        why: data.why ? JSON.parse(JSON.stringify(data.why)) : undefined,
      }
    })

    return NextResponse.json(generator, { status: 201 })
  } catch (error) {
    console.error('Error creating generator:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 