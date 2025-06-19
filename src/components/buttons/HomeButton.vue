<script setup lang="ts">
import { Motion } from 'motion-v'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useCountdownStore, useMainStore } from '~/stores'

defineProps<{
  text: string
}>()

const emits = defineEmits<{
  click: []
  hold: []
}>()

const mainStore = useMainStore()
const countdownStore = useCountdownStore()
const { state, running_session, total_session } = storeToRefs(mainStore)
const { isRunning } = storeToRefs(countdownStore)

let hold_timeout: ReturnType<typeof setInterval> | null = null

const hold_progress = ref<number>(0)
const isPaused = ref<boolean>(isRunning.value)
const isMouseDown = ref<boolean>(false)
const isHoldTriggered = ref<boolean>(false)

function handleButtonDown() {
  isMouseDown.value = true
  isHoldTriggered.value = false
  hold_progress.value = 0
  if (state.value !== 'INACTIVE') {
    const interval = 30
    const steps = 2000 / interval
    let step = 0

    hold_timeout = setInterval(() => {
      step++
      hold_progress.value = (step / steps) * 100
      if (step >= steps) {
        clearHold()
        clearInterval(hold_timeout!)
        hold_timeout = null
        isHoldTriggered.value = true

        setTimeout(() => {
          isPaused.value = !isPaused.value
          emits('hold')
        }, 100)
      }
    }, interval)
  }
}

function handleButtonUp() {
  if (!isMouseDown.value)
    return

  clearHold()
  if (isHoldTriggered.value)
    return

  if (state.value === 'INACTIVE') {
    state.value = 'FOCUS'
    running_session.value = total_session.value
    emits('click')
  }
}

function handleMouseLeave() {
  clearHold()
}

function clearHold() {
  isMouseDown.value = false
  hold_progress.value = 0
  if (hold_timeout) {
    clearInterval(hold_timeout)
    hold_timeout = null
  }
}

defineExpose({
  isPaused,
})
</script>

<template>
  <button
    type="button"
    class="w-fit h-fit mb-2 grid grid-cols-1 grid-rows-1 self-center rounded-xl overflow-hidden bg-light-50/25 focus:outline-none focus:ring-0"
    @pointerdown="handleButtonDown"
    @pointerup="handleButtonUp"
    @pointerleave="handleMouseLeave"
    @pointercancel="handleMouseLeave"
  >
    <div class="col-start-1 col-span-1 row-start-1 row-span-1 z-10 self-center px-4 py-3">
      <span class="uppercase font-semibold tracking-wide text-light-50">
        {{ text.toLowerCase() }}
      </span>
    </div>
    <Motion
      as="div"
      :initial="{ width: '0%' }"
      :animate="{ width: `${hold_progress}%` }"
      :transition="{
        duration: 0.1,
        ease: 'easeInOut',
      }"
      :class="[!isPaused ? 'bg-soft-red-300' : 'bg-soft-blue-300']"
      class="col-start-1 col-span-1 row-start-1 row-span-1 h-full"
    />
  </button>
</template>
