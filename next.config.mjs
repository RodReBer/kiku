/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blob.vercel-storage.com",
        port: "",
        pathname: "/v1/assets/kiku-cream/**",
      },
      {
        protocol: "https",
        hostname: "v0.dev",
        port: "",
        pathname: "/placeholder.svg",
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
