/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      // Sin `all`, v8 solo mide los archivos que algún test importa, lo que
      // deja fuera del denominador a los módulos que no tienen tests.
      all: true,
      include: ['src/**/*.{js,jsx,tsx}'],
      exclude: ['src/test/**', 'src/setupTests.js'],
    },
  },
})
