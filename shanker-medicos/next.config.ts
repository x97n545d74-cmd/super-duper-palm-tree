import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
const isDev = process.env.NODE_ENV !== "production";

// Publish-only mode (no database) is decided at build time and baked into the
// bundle, so it holds on any host: Vercel, Netlify (free plan) or a plain server.
const onHost = process.env.VERCEL === "1" || process.env.NETLIFY === "true" || process.env.PUBLISH_ONLY === "1";
const publishOnly = !(supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && onHost;
// Netlify gives the site's main address in URL at build time.
const hostUrl = process.env.NETLIFY === "true" ? process.env.URL || "" : "";

// Content Security Policy. Inline styles are needed by Next/React; inline
// scripts are needed for JSON-LD and Next's bootstrap. Google Tag Manager,
// GA4 and Meta Pixel are allowed but only load after cookie consent and only
// when their IDs are configured.
const ANALYTICS = "https://static.cloudflareinsights.com https://cloudflareinsights.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://www.facebook.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com https://connect.facebook.net${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${ANALYTICS} https://www.google.co.in${supabaseHost ? ` https://${supabaseHost}` : ""}`,
  "font-src 'self'",
  `connect-src 'self' ${ANALYTICS}${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
  "media-src 'self'",
  "frame-src https://www.google.com https://maps.google.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Classic caching model (unstable_cache + tags). See docs/ARCHITECTURE.md.
  cacheComponents: false,
  poweredByHeader: false,
  env: { PUBLISH_ONLY: publishOnly ? "1" : "", HOST_SITE_URL: hostUrl },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
    // Tailwind CSS is small and atomic; inlining it removes a render-blocking request for first-time visitors.
    inlineCss: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
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
