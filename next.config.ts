import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: "/kondicionerebi", destination: "/air-conditioners", permanent: true },
      { source: "/gamatbobeli", destination: "/heaters", permanent: true },
      { source: "/wylis-gamacxelebeli", destination: "/water-heaters", permanent: true },
      { source: "/aqsesuarebi", destination: "/accessories", permanent: true },
      { source: "/montaji", destination: "/installation", permanent: true },
      { source: "/shearchie", destination: "/calculator", permanent: true },
      { source: "/gazis-qvabebi", destination: "/gas-boilers", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
