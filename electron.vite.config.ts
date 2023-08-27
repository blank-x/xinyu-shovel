import {resolve} from 'path'
import {defineConfig, externalizeDepsPlugin} from 'electron-vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import zipPlugin from './vite-plugin-dist-tozip'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@utils': resolve('src/utils'),
      }
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          searchPreload: resolve(__dirname, 'src/preload/searchPreload.ts'),
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },

  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          major: resolve(__dirname, 'src/renderer/major/index.html'),
          search: resolve(__dirname, 'src/renderer/search/index.html'),
        }
      },
    },
    resolve: {
      alias: {
        '@major': resolve('src/renderer/major/src'),
        '@search': resolve('src/renderer/search/src'),
        '@utils': resolve('src/utils'),
      }
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // zipPlugin(),
    ]
  }
})
