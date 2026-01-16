import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // 确保这里是点斜杠
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
})
