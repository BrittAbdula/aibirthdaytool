import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CardDisplay from '@/components/CardDisplay'
import { Suspense } from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import SpotifyPlayer from '@/components/SpotifyPlayer'
import MomentBackground from '@/components/recipient/MomentBackground'
import RecipientActions from '@/components/recipient/RecipientActions'
import MomentExperience from '@/components/moment/MomentExperience'
import { getRecipientTheme } from '@/lib/recipient-themes'
import { parseMomentConfig, parseMomentResponse } from '@/lib/moment-config'

interface Props {
  params: Promise<{ cardId: string }>
}

async function getCard(cardId: string) {
  if (cardId === 'test-card' || cardId === 'demo') {
     return {
       id: 'test-card',
       originalCardId: 'test-card',
       cardType: 'birthday',
       editedContent: '',
       r2Url: 'https://images.unsplash.com/photo-1513151233558-d860c539d99f?q=80&w=2075&auto=format&fit=crop',
       spotifyTrackId: null,
       message: 'Happy Birthday! This card has magical vibes now.',
       customUrl: 'test-card',
       recipientName: null,
       momentConfig: null,
       momentResponse: null
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
      originalCardId: true,
      cardType: true,
      editedContent: true,
      r2Url: true,
      spotifyTrackId: true,
      message: true,
      customUrl: true,
      recipientName: true,
      momentConfig: true,
      momentResponse: true
    }
  })

  return card
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { cardId } = await params
  const card = await getCard(cardId)

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
  const { cardId } = await params
  const card = await getCard(cardId)

  if (!card) {
    notFound()
  }

  const theme = getRecipientTheme(card.cardType)
  const momentConfig = parseMomentConfig(card.momentConfig)
  const momentResponse = parseMomentResponse(card.momentResponse)

  return (
    <main className="min-h-screen relative overflow-hidden">
      <MomentBackground theme={theme} />

      <div className="container mx-auto px-4 pt-2 pb-4 sm:pt-3 sm:pb-6 relative z-10">
        <section className="max-w-2xl mx-auto space-y-1.5 sm:space-y-3">
          <div className="animate-[fadeUp_0.8s_ease-out_forwards]">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                    style={{ borderColor: theme.accent }}
                  ></div>
                  <p className="text-sm font-medium" style={{ color: theme.textColor }}>
                    {theme.loadingMessage}
                  </p>
                </div>
              }
            >
              <CardDisplay card={{ cardType: card.cardType, r2Url: card.r2Url || '', svgContent: card.editedContent || '' }} />
            </Suspense>

            {momentConfig ? (
              <MomentExperience
                editedCardId={card.id}
                recipientName={card.recipientName}
                message={card.message}
                config={momentConfig}
                existingResponse={momentResponse}
                theme={{
                  accent: theme.accent,
                  textColor: theme.textColor,
                  buttonGradient: theme.buttonGradient,
                }}
              />
            ) : (
              card.message && (
                <div className="p-4 animate-[fadeUp_0.8s_ease-out_0.3s_forwards] opacity-0">
                  <div className="relative">
                    <div className="absolute -left-2 -top-2 text-lg opacity-60">❝</div>
                    <p className="italic text-center font-serif text-lg px-4" style={{ color: theme.textColor }}>
                      {card.message}
                    </p>
                    <div className="absolute -right-2 -bottom-2 text-lg opacity-60">❞</div>
                  </div>
                </div>
              )
            )}

            {card.spotifyTrackId && (
              <div className="mt-4 sm:mt-6 animate-[fadeUp_0.8s_ease-out_0.5s_forwards] opacity-0">
                <SpotifyPlayer trackId={card.spotifyTrackId} />
              </div>
            )}
          </div>
        </section>

        <RecipientActions
          editedCardId={card.id}
          originalCardId={card.originalCardId}
          cardType={card.cardType}
          theme={{
            accent: theme.accent,
            textColor: theme.textColor,
            buttonGradient: theme.buttonGradient,
            reply: theme.reply,
          }}
        />

        <footer className="mt-8 sm:mt-10 text-center animate-[fadeUp_0.8s_ease-out_1s_forwards] opacity-0">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
            <span className="text-sm" style={{ color: theme.textColor }}>
              Created with
            </span>
            <span className="inline-block animate-pulse" style={{ color: theme.accent }}>❤️</span>
            <span className="text-sm" style={{ color: theme.textColor }}>on</span>
            <Link
              href="/"
              className="transition-colors duration-300 font-semibold group"
              style={{ color: theme.accent }}
            >
              MewTruCard
              <span className="inline-block ml-1 group-hover:rotate-12 transition-transform duration-300">
                {theme.footerEmoji}
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
