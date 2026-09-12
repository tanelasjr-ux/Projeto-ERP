/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: [
    "*.preview.emergentagent.com",
    "*.preview.emergentcf.cloud",
    "*.cluster-12.preview.emergentcf.cloud",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "663da870-3bec-43c9-8a49-3712a1a956fb.preview.emergentagent.com",
        "663da870-3bec-43c9-8a49-3712a1a956fb.cluster-12.preview.emergentcf.cloud",
        "erp-financeiro-10.cluster-12.preview.emergentcf.cloud",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
