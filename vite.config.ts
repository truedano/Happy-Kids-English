import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages 部署時需要設定 base 路徑
  // 本地開發時使用 '/',部署到 GitHub Pages 時使用 '/Happy-Kids-English/'
  base: command === 'build' ? '/Happy-Kids-English/' : '/',

  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // 優化建置輸出
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'genai-vendor': ['@google/genai'],
        }
      }
    }
  }
}));
