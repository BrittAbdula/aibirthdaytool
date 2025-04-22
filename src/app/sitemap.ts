import { MetadataRoute } from 'next'
import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants'

function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mewtrucard.com/'
  const currentDate = new Date()

  // Base routes
  const baseRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      priority: 1,
    },
    {
      url: `${baseUrl}card-gallery/`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}cards/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}will-you-be-my-valentine/`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    },
  ]

  // Card type pages
  const cardTypeRoutes = CARD_TYPES.map(cardType => ({
    url: `${baseUrl}type/${cardType.type}/`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Relationship pages
  const relationshipRoutes = RELATIONSHIPS.map(relation => ({
    url: `${baseUrl}relationship/${relation.value}/`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Generator pages
  const generatorRoutes = CARD_TYPES.map(cardType => ({
    url: `${baseUrl}${cardType.type}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...baseRoutes,
    ...cardTypeRoutes,
    ...relationshipRoutes,
    ...generatorRoutes,
  ] satisfies MetadataRoute.Sitemap
}

export default sitemap