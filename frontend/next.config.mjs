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
    "*.cluster-5.preview.emergentcf.cloud",
    "11e05da8-228e-48e5-90a7-de813e1c1c61.cluster-5.preview.emergentcf.cloud",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "erp-preview-28.preview.emergentagent.com",
        "11e05da8-228e-48e5-90a7-de813e1c1c61.preview.emergentagent.com",
        "11e05da8-228e-48e5-90a7-de813e1c1c61.cluster-5.preview.emergentcf.cloud",
        "*.preview.emergentagent.com",
        "*.preview.emergentcf.cloud",
        "*.cluster-12.preview.emergentcf.cloud",
        "*.cluster-5.preview.emergentcf.cloud",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
