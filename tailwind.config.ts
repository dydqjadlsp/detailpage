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
				background: 'rgb(var(--color-background) / <alpha-value>)',
				surface: 'rgb(var(--color-surface) / <alpha-value>)',
				'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
				border: 'rgb(var(--color-border) / <alpha-value>)',
				'border-hover': 'rgb(var(--color-border-hover) / <alpha-value>)',
				'border-active': 'rgb(var(--color-border-active) / <alpha-value>)',

				primary: {
					DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-inverse) / <alpha-value>)',
					hover: 'rgb(var(--color-primary-hover) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-primary) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-inverse) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'rgb(var(--color-surface-hover) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-tertiary) / <alpha-value>)'
				},

				text: {
					primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
					secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
					tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
					inverse: 'rgb(var(--color-text-inverse) / <alpha-value>)'
				},

				success: 'rgb(var(--color-success) / <alpha-value>)',
				warning: 'rgb(var(--color-warning) / <alpha-value>)',
				error: 'rgb(var(--color-error) / <alpha-value>)',
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
			},
			fontFamily: {
				sans: ['var(--font-sans)'],
				mono: ['var(--font-mono)'],
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				aurora: 'aurora 60s linear infinite',
				shimmer: 'shimmer 2s linear infinite',
				meteor: 'meteor 5s linear infinite',
				'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
				float: 'float 6s ease-in-out infinite',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				aurora: {
					from: {
						backgroundPosition: '50% 50%, 50% 50%',
					},
					to: {
						backgroundPosition: '350% 50%, 350% 50%',
					},
				},
				shimmer: {
					from: {
						backgroundPosition: '0 0',
					},
					to: {
						backgroundPosition: '-200% 0',
					},
				},
				meteor: {
					'0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
					'70%': { opacity: '1' },
					'100%': {
						transform: 'rotate(215deg) translateX(-500px)',
						opacity: '0',
					},
				},
				'border-beam': {
					'100%': {
						'offset-distance': '100%',
					},
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' },
				},
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;

