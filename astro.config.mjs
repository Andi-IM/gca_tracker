// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  output: 'static',
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Server API belum berjalan di http://localhost:3001. Jalankan "npm run dev:api" atau "uv run python -m api.server" di terminal terpisah.'
                }));
              }
            });
          }
        }
      }
    }
  },
  build: {
    format: 'directory'
  }
});
