import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
  experimental: {
    agentUpgrade: "security",
    serverActions: {
      bodySizeLimit: "16gb",
    },
    proxyClientMaxBodySize: "16gb",
  },
  images: {
    qualities: [75, 95, 100],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
