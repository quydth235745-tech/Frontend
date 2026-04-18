import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'react-vendor';
          }

          if (id.includes('/react-toastify/') || id.includes('/@react-oauth/google/')) {
            return 'ui-vendor';
          }

          if (id.includes('/axios/')) {
            return 'data-vendor';
          }

          if (id.includes('/jspdf/') || id.includes('/qrcode/') || id.includes('/xlsx/')) {
            return 'pdf-vendor';
          }
        },
      },
    },
  },
})
