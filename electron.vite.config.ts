import {resolve} from 'path'
import {defineConfig, externalizeDepsPlugin} from 'electron-vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'

const commonAlias = {
  '@renderer': resolve('src/renderer'),
  '@utils': resolve('src/utils'),
  'constants': resolve('src/constants'),
  'utils': resolve('src/utils'),
  'renderer': resolve('src/renderer'),
  'main': resolve('src/main'),
  'types': resolve('src/types'),
  '@home': resolve('src/renderer/home/src'),
  '@search': resolve('src/renderer/search/src'),
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        ...commonAlias
      }
    },
    build: {
      rollupOptions: {
        input: {
          search: resolve(__dirname, 'src/main/search.ts'),
          home: resolve(__dirname, 'src/main/home/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        ...commonAlias
      }
    },
    build: {
      rollupOptions: {
        input: {
          search: resolve(__dirname, 'src/preload/search.ts'),
          home: resolve(__dirname, 'src/preload/home.ts'),
        },
      },
    },

  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          home: resolve(__dirname, 'src/renderer/home/index.html'),
          search: resolve(__dirname, 'src/renderer/search/index.html'),
        }
      },
    },
    resolve: {
      alias: {
        ...commonAlias
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
