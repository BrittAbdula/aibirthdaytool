import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // These packages publish workerd-specific exports that Wrangler must resolve.
    serverExternalPackages: ['@prisma/client', '.prisma/client'],
    async redirects() {
        return [
            {
                source: '/will-you-be-my-valentine-manghud',
                destination: '/will-you-be-my-valentine/',
                permanent: true,
            },
        ];
    },
    trailingSlash: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'store.celeprime.com'
            },
            {
                protocol: 'https',
                hostname: 'api.producthunt.com'
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'tempfile.aiquickdraw.com'
            },
        ],
    },
};

initOpenNextCloudflareForDev()

export default nextConfig;
