import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],define:{"process.env.MUI_VERSION": "\"9.2.0\"", "process.env.MUI_MAJOR_VERSION": "\"9\"", "process.env.MUI_MINOR_VERSION": "\"2\"", "process.env.MUI_PATCH_VERSION": "\"0\"", "process.env.MUI_PRERELEASE": "\"\""},build:{commonjsOptions:{include:[/node_modules/,/runtime-packages[\\/]mui-icons-material/]}},server:{host:'127.0.0.1',strictPort:true,proxy:{'/api':{target:process.env.CI4A_API_URL||'http://127.0.0.1:5000',changeOrigin:true}}}});
