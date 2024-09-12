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
  			background: 'hsl(0, 0%, 10%)', // Dark background
  			foreground: 'hsl(0, 0%, 100%)', // White text
  			card: {
  				DEFAULT: 'hsl(0, 0%, 10%)', // Dark card background
  				foreground: 'hsl(0, 0%, 100%)' // White card text
  			},
  			popover: {
  				DEFAULT: 'hsl(0, 0%, 10%)', // Dark popover background
  				foreground: 'hsl(0, 0%, 100%)' // White popover text
  			},
  			primary: {
  				DEFAULT: '#FDE884', // Accent color
  				foreground: 'hsl(0, 0%, 10%)' // Dark background for primary
  			},
  			secondary: {
  				DEFAULT: '#FDE884', // Accent color for secondary
  				foreground: 'hsl(0, 0%, 10%)' // Dark background for secondary
  			},
  			muted: {
  				DEFAULT: 'hsl(0, 0%, 20%)', // Muted dark color
  				foreground: 'hsl(0, 0%, 80%)' // Light muted text
  			},
  			accent: {
  				DEFAULT: '#FDE884', // Accent color
  				foreground: 'hsl(0, 0%, 10%)' // Dark background for accent
  			},
  			destructive: {
  				DEFAULT: 'hsl(0, 100%, 50%)', // Red for destructive actions
  				foreground: 'hsl(0, 0%, 10%)' // Dark background for destructive
  			},
  			border: 'hsl(0, 0%, 50%)', // Gray border
  			input: 'hsl(0, 0%, 20%)', // Dark input background
  			ring: '#FDE884' // Accent color for rings
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
