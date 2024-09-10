import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(230, 20%, 10%)', // Dark blue-gray
  			foreground: 'hsl(180, 100%, 75%)', // Cyan
  			card: {
  				DEFAULT: 'hsl(250, 30%, 15%)', // Dark purple
  				foreground: 'hsl(180, 100%, 75%)' // Cyan
  			},
  			popover: {
  				DEFAULT: 'hsl(250, 30%, 15%)', // Dark purple
  				foreground: 'hsl(180, 100%, 75%)' // Cyan
  			},
  			primary: {
  				DEFAULT: 'hsl(320, 100%, 50%)', // Neon pink
  				foreground: 'hsl(230, 20%, 10%)' // Dark blue-gray
  			},
  			secondary: {
  				DEFAULT: 'hsl(180, 100%, 50%)', // Neon cyan
  				foreground: 'hsl(230, 20%, 10%)' // Dark blue-gray
  			},
  			muted: {
  				DEFAULT: 'hsl(250, 20%, 20%)', // Muted purple
  				foreground: 'hsl(180, 60%, 70%)' // Muted cyan
  			},
  			accent: {
  				DEFAULT: 'hsl(60, 100%, 50%)', // Neon yellow
  				foreground: 'hsl(230, 20%, 10%)' // Dark blue-gray
  			},
  			destructive: {
  				DEFAULT: 'hsl(0, 100%, 50%)', // Neon red
  				foreground: 'hsl(230, 20%, 10%)' // Dark blue-gray
  			},
  			border: 'hsl(180, 100%, 50%)', // Neon cyan
  			input: 'hsl(250, 30%, 15%)', // Dark purple
  			ring: 'hsl(320, 100%, 50%)' // Neon pink
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	},
  	colors: {
        'cyberpunk-bg': 'hsl(220, 40%, 10%)', // Darker, more saturated blue
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
