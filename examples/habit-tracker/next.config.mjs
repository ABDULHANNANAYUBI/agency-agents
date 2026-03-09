/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker multi-stage build (copies minimal server files)
  output: "standalone",
};

export default nextConfig;
