import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://rubbereco-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  base: '/',
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://rubbereco-backend.onrender.com/api'),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify('https://rubbereco-backend.onrender.com'),
  },
})
