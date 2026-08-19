import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '~/utils'
import { useMainStore } from './mainStore'

const useCountdownStore = defineStore('countdown', () => {
  const mainStore = useMainStore()
  const { focus_session } = storeToRefs(mainStore)

  const total_second = useStorage({
    key: 'total_second',
    type: 'u32',
    default: focus_session.value * 60,
  })
  const running_second = useStorage({
    key: 'running_second',
    type: 'u32',
    default: total_second.value,
  })
  const isRunning = useStorage({
    key: 'is_running',
    default: false,
  })
  const restartToken = ref(0)

  function formatTime(value: number) {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return {
    total_second,
    running_second,
    isRunning,
    restartToken,
    formatTime,
  }
})

export {
  useCountdownStore,
}
