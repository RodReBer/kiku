/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Exportación estática para Hostinger

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
        hostname: "rodrigorey.info",
        port: "",
        pathname: "/placeholder.svg",
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
