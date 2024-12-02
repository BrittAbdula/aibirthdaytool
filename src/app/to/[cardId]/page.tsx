import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CardDisplay from '@/components/CardDisplay'
import LoadingFallback from '@/components/LoadingFallback'
import { Suspense } from 'react'
import { Metadata, ResolvingMetadata } from 'next'

interface Props {
  params: { cardId: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const cardId = params.cardId
  const card = await prisma.editedCard.findUnique({ where: { id: cardId } })
  if (!card) {
    return {
      title: 'Card Not Found',
    }
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/${cardId}`

  const title = `Personalized ${card.cardType} Card`
  const description = `A custom ${card.cardType} card created just for you. Celebrate with style!`
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/to/${cardId}`

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
  const { cardId } = params
  const card = await prisma.editedCard.findUnique({ where: { id: cardId } })

  if (!card) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 py-8 sm:py-12 md:py-16">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-pink-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 right-20 w-[600px] h-[600px] bg-yellow-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Card Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)} Card
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            A special card made just for you with ✨ AI magic ✨
          </p>
        </header>

        {/* Card Display Section */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8 hover:shadow-2xl transition-all duration-300">
            <Suspense 
              fallback={
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="text-gray-500">Loading your special card...</p>
                </div>
              }
            >
              <CardDisplay card={card} />
            </Suspense>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="mt-12 sm:mt-16 text-center">
          <p className="text-sm text-gray-500">
            Created with ❤️ using{' '}
            <a 
              href="/" 
              className="text-purple-600 hover:text-pink-600 transition-colors duration-200 font-medium"
            >
              MewTruCard
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}