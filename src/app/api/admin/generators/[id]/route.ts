import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminRequest } from '@/lib/admin-auth'

// 获取单个生成器
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const access = await requireAdminRequest()
    if (!access.ok) {
      return access.response
    }
    
    const generator = await prisma.cardGenerator.findUnique({
      where: { id }
    })

    if (!generator) {
      return NextResponse.json(
        { error: 'Generator not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(generator)
  } catch (error) {
    console.error('Error fetching generator:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 更新生成器
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const access = await requireAdminRequest()
    if (!access.ok) {
      return access.response
    }
    
    const data = await req.json()
    
    // 校验数据
    if (data.slug) {
      // 检查slug唯一性，排除当前ID
      const existing = await prisma.cardGenerator.findFirst({
        where: {
          slug: data.slug,
          id: { not: id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'A generator with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // 预处理JSON字段
    const updateData: any = { ...data }
    
    // 确保JSON字段正确处理
    if (data.fields !== undefined) {
      updateData.fields = typeof data.fields === 'string' 
        ? JSON.parse(data.fields) 
        : data.fields
    }
    
    if (data.why !== undefined) {
      updateData.why = typeof data.why === 'string' 
        ? JSON.parse(data.why) 
        : data.why
    }
    
    if (data.advancedFields !== undefined) {
      updateData.advancedFields = typeof data.advancedFields === 'string' 
        ? JSON.parse(data.advancedFields) 
        : data.advancedFields
    }

    // 更新生成器
    const updatedGenerator = await prisma.cardGenerator.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedGenerator)
  } catch (error) {
    console.error('Error updating generator:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 删除生成器
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const access = await requireAdminRequest()
    if (!access.ok) {
      return access.response
    }
    
    await prisma.cardGenerator.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting generator:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
