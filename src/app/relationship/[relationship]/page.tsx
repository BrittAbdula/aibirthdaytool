import { Metadata } from 'next'
import RelationshipGalleryContent from './RelationshipGalleryContent'
import { ScrollToTop } from '@/components/ScrollToTop'

interface Props {
  params: { relationship: string }
}

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const relationship = decodeURIComponent(params.relationship)
  const title = `${relationship.charAt(0).toUpperCase() + relationship.slice(1)} Cards | AI Birthday Tool`
  const description = `Create personalized ${relationship.toLowerCase()} cards with our AI-powered tool. Express your feelings with unique, custom-designed cards for your ${relationship.toLowerCase()} celebrations.`

  return {
    title,
    description,
    alternates: {
      canonical: `/relationship/${params.relationship}/`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${relationship} Cards Preview`
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

export default function RelationshipPage({ params }: Props) {
  return (
    <>
      <RelationshipGalleryContent params={params} />
      <ScrollToTop />
    </>
  )
} 