/** @type {import('postcss-load-config').Config} */
import tailwindcss from "./tailwind.config.js"

const config = {
  plugins: {
    tailwindcss: { config: tailwindcss },
    autoprefixer: {},
  },
};

export default config;
