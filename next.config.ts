import type { NextConfig } from "next";

/* Static export for Netlify (manual zip upload of `out/`); trailing slashes keep the existing URLs. */
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default config;
