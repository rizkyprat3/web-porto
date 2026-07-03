import type { NextConfig } from "next";

/**
 * Content Security Policy.
 * - `unsafe-inline` script is required by Next.js hydration (no nonce setup on static hosting).
 * - `frame-src 'self'` allows the sandboxed same-origin game iframes (/games/*).
 * - Everything else is locked to self.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // SAMEORIGIN (not DENY) so our own arcade iframes keep working.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // NOTE: /public assets are served by Next with ETag-based caching
      // (Cache-Control cannot be overridden here); CDNs like Vercel cache
      // them at the edge automatically.
    ];
  },
};

export default nextConfig;
