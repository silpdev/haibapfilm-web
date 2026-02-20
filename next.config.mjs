/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.ophim.live' },
      { protocol: 'https', hostname: 'ophim1.com' },
      { protocol: 'https', hostname: '*.ophim.live' },
    ],
  },
};

export default nextConfig;
