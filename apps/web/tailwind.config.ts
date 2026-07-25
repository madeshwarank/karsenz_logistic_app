import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        service: '#0f766e',
        road: '#334155',
        warning: '#b45309',
      },
    },
  },
  plugins: [],
};

export default config;
