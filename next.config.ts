import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  redirects: async () => [
    { source: "/roadmap", destination: "/board", permanent: true },
  ],
};

export default nextConfig;
