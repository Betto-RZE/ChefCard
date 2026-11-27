import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { rfidBridgePlugin } from './rfidBridgePlugin.ts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    rfidBridgePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'chefcard-logo.svg'],
      manifest: {
        name: 'ChefCard — Asistente de Cocina RFID',
        short_name: 'ChefCard',
        description: 'Asistente personal de cocina activado con tarjetas físicas RFID.',
        theme_color: '#ea580c',
        background_color: '#fafaf9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
