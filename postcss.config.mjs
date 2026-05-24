// Tailwind v4 uses its dedicated PostCSS plugin; no tailwind.config.js needed —
// theme tokens live in globals.css inside an @theme block.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
