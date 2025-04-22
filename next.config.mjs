/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'store.celeprime.com'
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com'
            }],
    },
};

export default nextConfig;
