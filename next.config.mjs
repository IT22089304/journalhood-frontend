/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://journalhood-backend-production.up.railway.app',
  },
  // Configure static file serving and authentication isolation
  async headers() {
    return [
      {
        source: '/webStudent/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Student-App',
            value: 'isolated',
          },
        ],
      },
      {
        source: '/webStudent/index.html',
        headers: [
          {
            key: 'Clear-Site-Data',
            value: '"cookies", "storage", "cache"',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      
    ]
  },
}

export default nextConfig
