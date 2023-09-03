import { createRouter, createWebHashHistory, RouteRecordRaw as RouteRecordRawCopy } from 'vue-router'
import Doc from '@home/pages/doc/index.vue'
import Main from '@home/pages/main/index.vue'

export type RouteRecordRaw = RouteRecordRawCopy & {
  hidden?: boolean
  children?: RouteRecordRaw[]
  alwaysShow?: boolean
}
/* Router Modules */

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/doc',
    component: Doc,
  },
  {
    path: '',
    component: Main,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

router.onError((e) => {
  console.log('onError: ', e)
})

export default router
