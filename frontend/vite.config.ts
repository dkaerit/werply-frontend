// plugins
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul';
import svgLoader from 'vite-svg-loader'

// utilities
import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: true,
    port: 8080,
  },
  plugins: [
    vue(), 
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/'],
      extension: ['.js', '.ts', '.vue'],
      requireEnv: false,
      cypress: true,
      forceBuildInstrument: true
    }),
    svgLoader({ svgoConfig: {} })
  ],
  define: { 'process.env': {} },
  resolve: {
    // Utiliza path.resolve para obtener la ruta absoluta
    alias: { '@': path.resolve(__dirname, './src') },
    extensions: [ '.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue' ],
  }
})
