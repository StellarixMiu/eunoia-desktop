<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ProgressBar from '~/components/ProgressBar.vue'
import { useCountdownStore, useMainStore } from '~/stores'

const emits = defineEmits<{
  countdownEnd: []
}>()

const mainStore = useMainStore()
const countdownStore = useCountdownStore()
const { running_session, state } = storeToRefs(mainStore)
const { total_second, running_second, isRunning } = storeToRefs(countdownStore)

let interval: ReturnType<typeof setInterval> | null = null

function startCountdown() {
  if (isRunning.value || running_second.value <= 0)
    return
  isRunning.value = true

  interval = setInterval(() => {
    if (running_second.value > 0) {
      running_second.value--
    }
    else {
      if (running_session.value > 0 && state.value === 'FOCUS')
        running_session.value--

      emits('countdownEnd')
      stopCountdown()
    }
  }, 1000)
}

function stopCountdown() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  isRunning.value = false
}

function resetCountdown() {
  stopCountdown()
  running_second.value = total_second.value
}

function toggleCountdown() {
  isRunning.value ? stopCountdown() : startCountdown()
}

defineExpose({
  total_second,
  resetCountdown,
  toggleCountdown,
})
</script>

<template>
  <h1 class="font-semibold text-8xl lining-nums text-light-50">
    {{ countdownStore.formatTime(running_second) }}
  </h1>
  <div class="w-full h-16 flex justify-center items-center">
    <ProgressBar
      :total-second="total_second"
      :running-second="running_second"
    />
  </div>
</template>
