<script setup lang="ts">
import { getAllWindows } from '@tauri-apps/api/window'
import { storeToRefs } from 'pinia'
import { nextTick, onMounted, useTemplateRef } from 'vue'
import HoldButton from '~/components/buttons/HoldButton.vue'
import CountdownTimer from '~/components/CountdownTimer.vue'
import { useCountdownStore, useMainStore } from '~/stores'
import { logger } from '~/utils'

const mainStore = useMainStore()
const countdownStore = useCountdownStore()

const {
  focus_session,
  state,
  IconState,
  stateIndicator,
} = storeToRefs(mainStore)

const CountdownTimerComponent = useTemplateRef<InstanceType<typeof CountdownTimer>>('countdown-timer-component')

async function restartFocus() {
  const windows = await getAllWindows()
  const main_index = windows.findIndex(({ label }) => label.startsWith('main'))
  const interrupts_window = windows.filter(({ label }, i) => label.startsWith('interrupt') && i !== main_index)
  const mainWindow = windows[main_index]
  if (!mainWindow) {
    logger.error('[ERROR] no main window found')

    return
  }
  if (!CountdownTimerComponent.value) {
    logger.error('[ERROR] no CountdownTimerComponent.value found')

    return
  }

  mainStore.playSound('SHORT', 1)
  CountdownTimerComponent.value.total_second = focus_session.value * 60
  state.value = 'FOCUS'
  CountdownTimerComponent.value.resetCountdown()

  mainWindow.unminimize()
  mainWindow.show()
  mainWindow.setFocus()

  for (let i = 0; i < interrupts_window.length; i++) {
    interrupts_window[i].close()
  }
}

onMounted(() => nextTick(async () => {
  if (countdownStore.running_second > 0)
    CountdownTimerComponent.value?.toggleCountdown()
}))
</script>

<template>
  <div class="w-full h-full p-8 flex flex-col bg-dark-950/50">
    <div class="relative w-full h-full flex flex-col justify-center items-center">
      <IconState
        :class="[state === 'FOCUS' ? 'fill-soft-red-300' : state === 'SHORT' ? 'fill-soft-blue-300' : state === 'LONG' ? 'fill-soft-yellow-200' : 'fill-light-50']"
        class="size-8"
      />
      <h1 class=" text-gray-400 font-semibold tracking-wide italic transition-all capitalize ease-in-out">
        {{ stateIndicator.toLowerCase() }}
      </h1>
      <CountdownTimer
        ref="countdown-timer-component"
        @countdown-end="restartFocus"
      />
      <HoldButton
        text="hold to skip break"
        class="mb-2"
        progress-class="bg-soft-blue-300"
        @hold="restartFocus"
      />
    </div>
  </div>
</template>
