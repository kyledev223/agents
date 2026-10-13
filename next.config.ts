import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Front-end only: `next build` writes a fully static site to /out.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
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
