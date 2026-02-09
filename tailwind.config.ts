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
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;

