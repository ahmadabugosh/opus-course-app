import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack bundler for API routes that depend on jsPDF (fflate uses dynamic Worker which Turbopack can't resolve)
  bundlePagesRouterDependencies: true,
  serverExternalPackages: ['jspdf'],
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/course",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
