import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Bill Splitter & Debt Tracker',   // Nama panjang (muncul saat proses instalasi)
        short_name: 'BillSplitter',   // Nama pendek (muncul di bawah ikon HP)
        description: 'Aplikasi pencatat keuangan dan patungan',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',        // Standalone = Menghilangkan address bar Chrome saat diinstal

        icons: [
          // Nanti kita bisa tambahkan icon di sini
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
