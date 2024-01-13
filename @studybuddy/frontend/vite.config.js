import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@studybuddy/backend": path.join(path.resolve(__dirname, '..', 'backend', 'src')),
    }
  },
  plugins: [react()],
})
