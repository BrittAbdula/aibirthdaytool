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
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fff0f5]">
        {/* Base Gradient - Pale Pink & Purple */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-white opacity-80"></div>
        
        {/* Soft Pastel Floating Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
        <div className="absolute bottom-1/4 left-1/2 w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply"></div>

        {/* Floating Particles/Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
           {[...Array(20)].map((_, i) => (
              <div 
                key={`bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-t from-white to-pink-100 shadow-sm animate-float-gentle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100 + 20}%`,
                  width: `${Math.random() * 30 + 10}px`,
                  height: `${Math.random() * 30 + 10}px`,
                  opacity: Math.random() * 0.4 + 0.2,
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
           ))}
        </div>

        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 pt-2 pb-4 sm:pt-3 sm:pb-6 relative z-10">
        <section className="max-w-2xl mx-auto space-y-1.5 sm:space-y-3">
          <div className="opacity-0 animate-fade-up">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
                  <p className="text-gray-500 text-sm">Loading your special card...</p>
                </div>
              }
            >
              <CardDisplay card={{ cardType: card.cardType, r2Url: card.r2Url || '', svgContent: card.editedContent || '' }} />
            </Suspense>

            {card.message && (
              <div className="p-4 opacity-0 animate-fade-up animation-delay-300">
                <p className="text-gray-700 italic text-center">
                &quot;{card.message}&quot;
                </p>
              </div>
            )}

            {card.spotifyTrackId && (
              <div className="mt-4 sm:mt-6 opacity-0 animate-fade-up animation-delay-500">
                <SpotifyPlayer trackId={card.spotifyTrackId} />
              </div>
            )}
          </div>
        </section>

        {/* Reply Button Section */}
        <div className="mt-6 sm:mt-8 flex justify-center opacity-0 animate-fade-up animation-delay-800">
          <a
            href="/thankyou/"
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white/20 to-transparent h-1/2 rounded-full"></span>
            <span className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent rounded-full"></span>
            <span className="relative flex items-center space-x-2">
              <span className="text-sm sm:text-base font-semibold">Send a Thank You Card Back</span>
              <span className="inline-block transition-transform group-hover:translate-x-1">💝</span>
            </span>
          </a>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-center opacity-0 animate-fade-up animation-delay-900">
          <a
            href={`/${card.cardType}/edit/${card.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-purple-200 px-6 py-2 text-sm sm:text-base font-semibold text-purple-600 hover:text-pink-600 hover:border-pink-300 transition-colors duration-200"
          >
            Customize this card
          </a>
        </div>

        <footer className="mt-6 sm:mt-8 text-center opacity-0 animate-fade-up animation-delay-1000">
          <p className="text-xs sm:text-sm text-gray-500">
          ✨{' '}Created with{' '}
            <span className="inline-block animate-bounce">❤️</span>{' '}
            on {' '}
            <a
              href="/"
              className="text-purple-600 hover:text-pink-600 transition-colors duration-200 font-medium group"
            >
              MewTruCard.com{' '}
              <span className="inline-block transition-transform group-hover:rotate-12">✨</span>
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
