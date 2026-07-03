import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Bill Splitter & Debt Tracker',
        short_name: 'BillSplitter',
        description: 'Aplikasi pencatat keuangan dan patungan',
        theme_color: '#ffffff',
        icons: [
          // Nanti kita bisa tambahkan icon di sini
        ]
      }
    })
  ],
})
