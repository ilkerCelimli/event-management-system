import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev ortamında /api isteklerini Spring Boot backend'ine yönlendirir.
// Böylece tarayıcı tarafında CORS sorunu yaşanmaz.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});