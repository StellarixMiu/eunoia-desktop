<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref, useTemplateRef, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import ClickButton from '~/components/buttons/ClickButton.vue'
import HoldButton from '~/components/buttons/HoldButton.vue'
import CountdownTimer from '~/components/CountdownTimer.vue'
import { useCountdownStore, useMainStore } from '~/stores'

const mainStore = useMainStore()
const countdownStore = useCountdownStore()
const {
  state,
  focus_session,
  short_break,
  long_break,
  total_session,
  running_session,
  IconState,
  stateIndicator,
} = storeToRefs(mainStore)
const { total_second, running_second } = storeToRefs(countdownStore)

const isPauseButton = ref<boolean>(false)

const CountdownTimerComponent = useTemplateRef<InstanceType<typeof CountdownTimer>>('countdown-timer-component')

function hideWindow() {
  const mainWindow = getCurrentWindow()
  mainWindow.hide()
}

function handleClickButton() {
  if (!CountdownTimerComponent.value)
    return

  CountdownTimerComponent.value.toggleCountdown()
  state.value = 'FOCUS'
  running_session.value = total_session.value
  isPauseButton.value = true
}

function handleHoldButton() {
  if (!CountdownTimerComponent.value)
    return

  CountdownTimerComponent.value.toggleCountdown()
  isPauseButton.value = false
}

async function handleCountdownEnd() {
  if (!CountdownTimerComponent.value)
    return

  switch (state.value) {
    case 'FOCUS':
      CountdownTimerComponent.value.total_second = (running_session.value > 0 ? short_break.value : long_break.value) * 60
      state.value = running_session.value > 0 ? 'SHORT' : 'LONG'
      break
    case 'SHORT':
      CountdownTimerComponent.value.total_second = focus_session.value * 60
      state.value = 'FOCUS'
      break
    case 'LONG':
      CountdownTimerComponent.value.total_second = focus_session.value * 60
      state.value = 'INACTIVE'
      break
  }
  CountdownTimerComponent.value.resetCountdown()

  if (state.value !== 'INACTIVE') {
    mainStore.playSound(running_session.value > 0 ? 'SHORT' : 'LONG', running_session.value > 0 ? 1 : 0.8)
    if (state.value === 'FOCUS')
      return
    if (state.value === 'LONG') {
      CountdownTimerComponent.value.toggleCountdown()
      return
    }

    hideWindow()
    await invoke<void>('create_interrupt_window')
  }
}

watch(state, (value, oldValue) => {
  if (CountdownTimerComponent.value && (oldValue === 'SHORT' && value === 'FOCUS')) {
    CountdownTimerComponent.value.toggleCountdown()
  }
})

onBeforeRouteLeave(async () => state.value === 'INACTIVE')
onBeforeMount(() => {
  total_second.value = focus_session.value * 60
  running_second.value = total_second.value
})
</script>

<template>
  <div class="w-full h-full p-8 flex flex-col">
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
        @countdown-end="handleCountdownEnd"
      />
      <ClickButton
        v-if="!isPauseButton"
        text="tap to start"
        class="mb-2"
        ripple-class="bg-soft-blue-300"
        @click="handleClickButton"
      />
      <HoldButton
        v-else
        text="hold to pause"
        class="mb-2"
        progress-class="bg-soft-red-300/85"
        @hold="handleHoldButton"
      />
    </div>
  </div>
</template>
