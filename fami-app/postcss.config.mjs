/** @type {import('next').NextConfig} */

// NOTE: Tailwind v4 uses CSS-first config (no tailwind.config.ts needed).
// All design tokens live in src/app/globals.css under @theme {}.
// This postcss config wires up @tailwindcss/postcss for the build.

const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
