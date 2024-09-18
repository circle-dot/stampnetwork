/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
          {
            source: '/',
            destination: '/explorer',
            permanent: true, // Set to true if you want a 308 permanent redirect, or false for a 307 temporary redirect
          },
        ]
      },
      reactStrictMode: true,
      webpack: config => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
      },};

export default nextConfig;
