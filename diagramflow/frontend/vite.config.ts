import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://flowdraw1.northeurope.cloudapp.azure.com:8080',
        changeOrigin: true,
      },
    },
    allowedHosts: [
      "flowdraw1.northeurope.cloudapp.azure.com",
      "localhost",
      "127.0.0.1",
      "98.71.49.113"
    ],
    host: '0.0.0.0',
    port: 5173,
  },
})
