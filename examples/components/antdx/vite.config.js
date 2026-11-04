import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-vue';
export default defineConfig({ plugins: [plugin()], server: { host: '127.0.0.1', strictPort: true } });
