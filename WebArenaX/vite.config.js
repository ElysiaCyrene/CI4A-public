import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-vue';
export default defineConfig({plugins:[plugin()],server:{host:'127.0.0.1',strictPort:true,proxy:{'/api':{target:process.env.CI4A_API_URL || 'http://127.0.0.1:5000',changeOrigin:true}}}});
