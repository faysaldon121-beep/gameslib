/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  experimental: {
    serverComponentsExternalPackages: ["mongoose","@sparticuz/chromium-min", "puppeteer-core"],
    optimizePackageImports: ['flexsearch']
  },
  outputFileTracing: true,
  images: {
    remotePatterns: [
    { protocol: "https", hostname: "res.cloudinary.com" },
    { protocol: "https", hostname: "utfs.io" },
    { protocol: "https", hostname: "placehold.co" },
    { protocol: "https", hostname: "images.igdb.com" },
    { protocol: "https", hostname: "peskgames.com" }, 
    { protocol: "https", hostname: "ankergames.net" },
    {
        protocol: 'https',
        hostname: '**',
    },
    {
        protocol: 'https',
        hostname: 'ankergames.net',
        port: '',
        pathname: '/uploads/**'
    },
  ],
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.resolve.alias['@sanity-config'] = require.resolve('./sanity.config.ts');
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
