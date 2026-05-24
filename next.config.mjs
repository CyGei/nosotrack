/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so we can serve from GitHub Pages on the existing CNAME.
  // The build emits to ./out — a future GH Actions workflow will deploy
  // ./out to the gh-pages branch (or to the Pages source). For local dev,
  // `next dev` runs normally; the export only kicks in on `next build`.
  output: 'export',

  // Required for static export — Next's default Image optimization needs
  // a runtime server. Team portraits and the OG card are served as bare
  // <img> / <Image unoptimized />.
  images: { unoptimized: true },

  // Keep trailing slashes on for GH Pages compatibility.
  trailingSlash: true,

  // The /foundry-demo/ iframe app is a hand-built static bundle that
  // lives in `public/foundry-demo/`. Next copies everything under
  // `public/` to the static output, so the iframe is served from
  // `/foundry-demo/index.html` automatically. Regenerate the bundle with
  // `npm run build:demo`.
};

export default nextConfig;
