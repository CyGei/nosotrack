/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Static export has no runtime image optimizer.
  images: { unoptimized: true },
  // GitHub Pages compatibility.
  trailingSlash: true,
};

export default nextConfig;
