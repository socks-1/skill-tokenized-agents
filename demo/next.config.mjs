/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow transpiling the Solana wallet adapter packages
  transpilePackages: [],
  webpack: (config) => {
    // Required for @solana/web3.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
