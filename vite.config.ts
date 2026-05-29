import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
  },
  build: {
    // Phaser is ~1.2 MB minified — the entire app is one chunk anyway,
    // and code-splitting a monolithic game framework adds no benefit.
    chunkSizeWarningLimit: 1300,
  },
});
