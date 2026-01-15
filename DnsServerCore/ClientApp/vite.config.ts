import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/console/',
  build: {
    outDir: '../www/console',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['date-fns', 'axios', '@tanstack/react-query', 'react-hot-toast'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5380',
        changeOrigin: true,
      }
    }
  }
})
