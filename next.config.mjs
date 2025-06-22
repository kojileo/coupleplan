/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value:
              [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' https:",
                // External API connections
                [
                  "connect-src 'self'",
                  'https://*.supabase.co wss://*.supabase.co', // Supabase database & auth
                  'https://pagead2.googlesyndication.com', // Google Ads (if used)
                  'https://overpass-api.de', // Map data API
                  'https://api.openweathermap.org', // Weather data API
                ].join(' '),
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join('; ') + ';',
          },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
