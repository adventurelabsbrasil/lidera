import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "ftctmseyrqhckutpfdeq.supabase.co",
      },
    ],
  },
};

export default nextConfig;
