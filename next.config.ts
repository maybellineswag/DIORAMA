import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent directory otherwise confuses Next's automatic root detection.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
