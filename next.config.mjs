/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevent Next.js from bundling these packages that use native Node.js APIs
    // or complex module loading (workers, binary deps, etc.)
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
}

export default nextConfig
