import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We want a normal Node/server build, NOT static HTML export
  output: "standalone",
  // optional but nice
  // reactStrictMode: true,
};

export default nextConfig;
