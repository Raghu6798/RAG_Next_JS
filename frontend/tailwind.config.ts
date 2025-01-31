import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}"
  ], // Specify where Tailwind should scan for class names

  darkMode: "class", // Enables dark mode using 'class'
  
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
      },
    },
  },
  
  plugins: [],
};

export default config;
