import { MetadataRoute } from 'next'

function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mewtrucard.com/'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseUrl}card-gallery/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}birthday-card-gallery/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}love/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}sorry/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}anniversary/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}birthday/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}thankyou/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}congratulations/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}holiday/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}teacher/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}graduation/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}baby/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}wedding/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}good-luck/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}newyear/`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}christmas/`,
      lastModified: new Date(),
      priority: 0.6,
    },
  ]
}

export default sitemap