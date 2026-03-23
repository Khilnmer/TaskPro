import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        taskpro: {
          ink: "#111014",
          mist: "#f5f4ef",
          amber: "#f7a31b",
          teal: "#0f8b8d",
          clay: "#d86f45"
        }
      },
      boxShadow: {
        card: "0 20px 60px rgba(17, 16, 20, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
