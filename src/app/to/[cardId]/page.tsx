import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CardDisplay from '@/components/CardDisplay'
import { Suspense } from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import SpotifyPlayer from '@/components/SpotifyPlayer'

interface Props {
  params: { cardId: string }
}

async function getCard(cardId: string) {
  // 尝试通过 ID 或自定义 URL 查找卡片
  const card = await prisma.editedCard.findFirst({
    where: {
      OR: [
        { id: cardId },
        { customUrl: cardId }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return card
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const card = await getCard(params.cardId)
  
  if (!card) {
    return {
      title: 'Card Not Found',
    }
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/${card.id}` // 使用实际的 card.id
  const cardPath = card.customUrl || card.id // 使用自定义 URL 或 ID
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/to/${cardPath}`

  const title = `Personalized ${card.cardType} Card`
  const description = `A custom ${card.cardType} card created just for you. Celebrate with style!`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'MewTruCard',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Preview of ${card.cardType} card`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  }
}

export default async function EditedCardPage({ params }: Props) {
  const card = await getCard(params.cardId)

  if (!card) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-purple-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/2 -left-10 w-[250px] h-[250px] bg-pink-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 right-10 w-[350px] h-[350px] bg-yellow-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <section className="max-w-2xl mx-auto space-y-4">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
                <p className="text-gray-500 text-sm">Loading your special card...</p>
              </div>
            }
          >
            <CardDisplay card={card} />
          </Suspense>

          {card.spotifyTrackId && (
            <SpotifyPlayer trackId={card.spotifyTrackId} />
          )}
        </section>

        <footer className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Created with ❤️ using{' '}
            <a
              href="/"
              className="text-purple-600 hover:text-pink-600 transition-colors duration-200 font-medium"
            >
              MewTruCard.com  ✨
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}