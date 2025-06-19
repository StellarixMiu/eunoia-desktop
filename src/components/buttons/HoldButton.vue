<script setup lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

defineProps<{
  text: string
  progressClass: HTMLButtonElement['className']
}>()

const emits = defineEmits<{
  hold: []
}>()

const hold_progress = ref<number>(0)
const isMouseDown = ref<boolean>(false)

let holdTimeout: ReturnType<typeof setInterval> | null = null

function handleButtonDown() {
  isMouseDown.value = true
  hold_progress.value = 0

  const interval = 30
  const totalSteps = 2000 / interval
  let step = 0

  holdTimeout = setInterval(() => {
    if (!isMouseDown.value)
      return

    step++
    hold_progress.value = (step / totalSteps) * 100

    if (step >= totalSteps) {
      clearHold()

      emits('hold')
    }
  }, interval)
}

function handleButtonUp() {
  if (!isMouseDown.value)
    return

  clearHold()
}

function handleMouseLeave() {
  clearHold()
}

function clearHold() {
  isMouseDown.value = false
  hold_progress.value = 0
  if (holdTimeout) {
    clearInterval(holdTimeout)
    holdTimeout = null
  }
}
</script>

<template>
  <button
    type="button"
    class="relative w-fit h-fit grid grid-cols-1 grid-rows-1 self-center rounded-xl overflow-hidden bg-light-50/25 focus:outline-none focus:ring-0"
    @pointerdown="handleButtonDown"
    @pointerup="handleButtonUp"
    @pointerleave="handleMouseLeave"
    @pointercancel="handleMouseLeave"
  >
    <span class="col-start-1 col-span-1 row-start-1 row-span-1 z-10 self-center px-4 py-3 uppercase font-semibold tracking-wide text-light-50">
      {{ text.toLowerCase() }}
    </span>
    <Motion
      as="div"
      :initial="{ width: '0%' }"
      :animate="{ width: `${hold_progress}%` }"
      :transition="{ duration: 0.1, ease: 'easeInOut' }"
      :class="progressClass"
      class="col-start-1 col-span-1 row-start-1 row-span-1 h-full pointer-events-none"
    />
  </button>
</template>

<!-- :class="[!isPaused ? 'bg-soft-red-300' : 'bg-soft-blue-300']" -->
