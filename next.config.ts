import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', // esto permite imágenes locales durante desarrollo
      },
    ],
  },
};

export default nextConfig;
