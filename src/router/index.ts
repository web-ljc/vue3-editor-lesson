import { createRouter, createWebHistory, RouteRecordRaw  } from "vue-router";
// import HelloWorld from '../components/HelloWorld.vue'

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/',
  //   component: HelloWorld
  // }
]

const router = createRouter({
  // @ts-ignore
  history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/vue3' : '/'),
  routes
})

export default router
