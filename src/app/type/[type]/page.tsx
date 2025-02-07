import { Metadata } from 'next'
import { CardType } from '@/lib/card-config'
import TypeGalleryContent from './TypeGalleryContent'
import { ScrollToTop } from '@/components/ScrollToTop'

interface Props {
  params: { type: CardType }
}

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = decodeURIComponent(params.type)
  const title = `${type} Cards | AI Birthday Tool`
  const description = `Create personalized ${type.toLowerCase()} cards with our AI-powered tool. Express your feelings with unique, custom-designed cards for your ${type.toLowerCase()} celebrations.`

  return {
    title,
    description,
    alternates: {
      canonical: `/type/${params.type}/`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${type} Cards Preview`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg']
    },
  }
}

export default function TypePage({ params }: Props) {
  return (
    <>
      <TypeGalleryContent params={params} />
      <ScrollToTop />
    </>
  )
} 