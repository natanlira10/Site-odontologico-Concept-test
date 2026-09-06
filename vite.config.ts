import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: false,
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  preview: { proxy: { '/api': 'http://127.0.0.1:3001' } },
})
