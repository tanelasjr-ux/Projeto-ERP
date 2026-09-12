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
        "erp-preview-28.preview.emergentagent.com",
        "*.preview.emergentagent.com",
        "*.preview.emergentcf.cloud",
        "*.cluster-12.preview.emergentcf.cloud",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
