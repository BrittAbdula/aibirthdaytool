import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CardDisplay from '@/components/CardDisplay'
import { Suspense } from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import SpotifyPlayer from '@/components/SpotifyPlayer'
import ChristmasBackground from './christmas-background'

interface Props {
  params: { cardId: string }
}

async function getCard(cardId: string) {
  if (cardId === 'test-card' || cardId === 'demo') {
     return {
       id: 'test-card',
       cardType: 'birthday',
       editedContent: '',
       r2Url: 'https://images.unsplash.com/photo-1513151233558-d860c539d99f?q=80&w=2075&auto=format&fit=crop',
       spotifyTrackId: null,
       message: 'Happy Birthday! This card has magical vibes now.',
       customUrl: 'test-card'
     }
  }

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
    },
    select: {
      id: true,
      cardType: true,
      editedContent: true,
      r2Url: true,
      spotifyTrackId: true,
      message: true,
      customUrl: true
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

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/${card.id}`
  const cardPath = card.customUrl || card.id
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/to/${cardPath}`

  const title = `Personalized ${card.cardType} Card`
  const description = `A custom ${card.cardType} card created just for you. Celebrate with style!`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
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
    <main className="min-h-screen relative overflow-hidden">
      {/* Christmas Background */}
      <ChristmasBackground />

      <div className="container mx-auto px-4 pt-2 pb-4 sm:pt-3 sm:pb-6 relative z-10">
        <section className="max-w-2xl mx-auto space-y-1.5 sm:space-y-3">
          <div className="animate-[fadeUp_0.8s_ease-out_forwards]">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c41e3a]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs">❄️</span>
                    </div>
                  </div>
                  <p className="text-[#2d5a3f] text-sm font-medium">Unwrapping your special card...</p>
                </div>
              }
            >
              <CardDisplay card={{ cardType: card.cardType, r2Url: card.r2Url || '', svgContent: card.editedContent || '' }} />
            </Suspense>

            {card.message && (
              <div className="p-4 animate-[fadeUp_0.8s_ease-out_0.3s_forwards] opacity-0">
                <div className="relative">
                  <div className="absolute -left-2 -top-2 text-lg opacity-60">❝</div>
                  <p className="text-[#2d5a3f] italic text-center font-serif text-lg px-4">
                    {card.message}
                  </p>
                  <div className="absolute -right-2 -bottom-2 text-lg opacity-60">❞</div>
                </div>
              </div>
            )}

            {card.spotifyTrackId && (
              <div className="mt-4 sm:mt-6 animate-[fadeUp_0.8s_ease-out_0.5s_forwards] opacity-0">
                <SpotifyPlayer trackId={card.spotifyTrackId} />
              </div>
            )}
          </div>
        </section>

        {/* Reply Button Section */}
        <div className="mt-6 sm:mt-8 flex justify-center animate-[fadeUp_0.8s_ease-out_0.8s_forwards] opacity-0">
          <a
            href="/thankyou/"
            className="group relative inline-flex items-center justify-center px-8 py-3.5 overflow-hidden font-medium text-white transition-all duration-500 ease-out rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b1538 50%, #c41e3a 100%)',
              backgroundSize: '200% 200%',
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#8b1538] via-[#c41e3a] to-[#8b1538] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[shimmer_2s_infinite]"></span>
            <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white/30 to-transparent h-1/2 rounded-full"></span>
            <span className="relative flex items-center space-x-3">
              <span className="text-sm sm:text-base font-semibold tracking-wide">Send a Thank You Card Back</span>
              <span className="inline-block text-lg group-hover:animate-[wiggle_0.5s_ease-in-out_infinite]">🎁</span>
            </span>
          </a>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-center animate-[fadeUp_0.8s_ease-out_0.9s_forwards] opacity-0">
          <a
            href={`/${card.cardType}/edit/${card.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#2d5a3f]/30 px-6 py-2.5 text-sm sm:text-base font-semibold text-[#2d5a3f] hover:text-[#c41e3a] hover:border-[#c41e3a]/50 transition-all duration-300 backdrop-blur-sm bg-white/40 hover:bg-white/60"
          >
            <span className="mr-2">✨</span>
            Customize this card
          </a>
        </div>

        <footer className="mt-8 sm:mt-10 text-center animate-[fadeUp_0.8s_ease-out_1s_forwards] opacity-0">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
            <span className="text-[#2d5a3f] text-sm">
              Created with
            </span>
            <span className="inline-block animate-pulse text-[#c41e3a]">❤️</span>
            <span className="text-[#2d5a3f] text-sm">on</span>
            <a
              href="/"
              className="text-[#c41e3a] hover:text-[#8b1538] transition-colors duration-300 font-semibold group"
            >
              MewTruCard
              <span className="inline-block ml-1 group-hover:rotate-12 transition-transform duration-300">🎄</span>
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
