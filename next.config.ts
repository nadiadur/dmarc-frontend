import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['192.168.21.64'],
};
export default nextConfig;
