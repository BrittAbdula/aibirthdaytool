import { MetadataRoute } from 'next'
import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants'
import { getCuratedGeneratorSitemapSlugs } from '@/lib/generator-seo'
import { getGalleryComboStaticParams } from '@/lib/gallery-combos'
import { VIRAL_MICROSITES } from '@/lib/viral-microsites'

function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `${(process.env.NEXT_PUBLIC_BASE_URL || 'https://mewtrucard.com').replace(/\/$/, '')}/`
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
    {
      url: `${baseUrl}about/`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}how-it-works/`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}ai-and-editorial-policy/`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
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

  const curatedGeneratorRoutes = getCuratedGeneratorSitemapSlugs().map(slug => ({
    url: `${baseUrl}${slug}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }))

  const comboRoutes = getGalleryComboStaticParams().map((combo) => ({
    url: `${baseUrl}type/${combo.type}/for/${combo.relationship}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const viralMicrositeRoutes = VIRAL_MICROSITES.map((microsite) => ({
    url: `${baseUrl}${microsite.slug}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...baseRoutes,
    ...cardTypeRoutes,
    ...relationshipRoutes,
    ...generatorRoutes,
    ...curatedGeneratorRoutes,
    ...comboRoutes,
    ...viralMicrositeRoutes,
  ] satisfies MetadataRoute.Sitemap
}

export default sitemap
