import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent directory otherwise confuses Next's automatic root detection.
  turbopack: {
    root: __dirname,
  },
  // Dashboard was renamed to Home — keep old links/bookmarks working.
  async redirects() {
    return [{ source: "/dashboard", destination: "/home", permanent: false }];
  },
  // Illustrator files are PDF-compatible internally — serve them as PDF so
  // the browser's viewer can preview them inline.
  async headers() {
    return [
      {
        source: "/file-assets/:file*.ai",
        headers: [{ key: "Content-Type", value: "application/pdf" }],
      },
    ];
  },
};

export default nextConfig;
