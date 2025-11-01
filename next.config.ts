import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    browserDebugInfoInTerminal: true,
  },
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config, { isServer }) => {
    // Exclude functions directory from being processed by webpack
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push((context: string, request: string, callback: Function) => {
        if (request.startsWith('./functions/') || request.includes('/functions/')) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      });
    }
    return config;
  },
};

export default nextConfig;
