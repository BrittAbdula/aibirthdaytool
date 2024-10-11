import { prisma } from '@/lib/prisma'

// export const runtime = 'edge'

export async function GET(request: Request, { params }: { params: { cardId: string } }) {
  const card = await prisma.editedCard.findUnique({ where: { id: params.cardId } })

  if (!card) {
    return new Response('Card not found', { status: 404 })
  }

  const svgContent = card.editedContent

  // 设置正确的内容类型头部
  const headers = new Headers()
  headers.set('Content-Type', 'image/svg+xml')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  // 返回 SVG 内容
  return new Response(svgContent, {
    status: 200,
    headers: headers
  })
}