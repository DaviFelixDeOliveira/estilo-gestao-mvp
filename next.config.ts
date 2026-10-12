import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.app",
  ],
};

export default nextConfig;
