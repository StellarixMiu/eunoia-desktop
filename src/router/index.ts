import type { RouteRecordRaw } from 'vue-router'
import { storeToRefs } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useCountdownStore, useMainStore } from '~/stores'
import { loadTauriState } from '~/utils'

declare module 'vue-router' {
  interface RouteMeta {
    isTransparent: boolean
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    meta: {
      isTransparent: false,
    },
    components: {
      default: () => import('~/views/HomeView.vue'),
    },
  },
  {
    path: '/setting',
    name: 'setting',
    meta: {
      isTransparent: false,
    },
    components: {
      default: () => import('~/views/SettingView.vue'),
    },
  },
  {
    path: '/interrupt',
    name: 'interrupt',
    meta: {
      isTransparent: true,
    },
    components: {
      default: () => import('~/views/InterruptScreen.vue'),
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async () => {
  const mainStore = useMainStore()
  const countdownStore = useCountdownStore()

  const {
    isFirstOpen,
    total_session,
    focus_session,
    short_break,
    long_break,
    running_session,
  } = storeToRefs(mainStore)
  const { isRunning, running_second, total_second } = storeToRefs(countdownStore)

  if (isFirstOpen.value) {
    await loadTauriState([
      { key: 'total_session', type: 'u8', ref: total_session },
      { key: 'focus_session', type: 'u8', ref: focus_session },
      { key: 'short_break', type: 'u8', ref: short_break },
      { key: 'long_break', type: 'u8', ref: long_break },
      { key: 'running_session', type: 'u8', ref: running_session },
      { key: 'is_running', type: 'bool', ref: isRunning },
      { key: 'running_second', type: 'u32', ref: running_second },
      { key: 'total_second', type: 'u32', ref: total_second },
    ])

    isFirstOpen.value = false
  }

  return true
})

export { router }
