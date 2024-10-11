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
    <div className="container mx-auto flex justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <CardDisplay card={card} />
      </Suspense>
    </div>
  )
}