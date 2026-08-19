<script setup lang="ts">
import { Motion } from 'motion-v'
import { onBeforeUnmount, ref } from 'vue'

defineProps<{
  text: string
  progressClass: HTMLButtonElement['className']
}>()

const emits = defineEmits<{
  hold: []
}>()

const hold_progress = ref<number>(0)
const isHolding = ref<boolean>(false)
const isCompleted = ref<boolean>(false)

let holdTimeout: ReturnType<typeof setInterval> | null = null
let pointerId: number | null = null
let originX = 0
let originY = 0

const DRAG_TOLERANCE = 16
const interval = 30
const totalSteps = 2000 / interval

function handleButtonDown(event: PointerEvent) {
  if (isHolding.value)
    return

  isHolding.value = true
  isCompleted.value = false
  hold_progress.value = 0
  pointerId = event.pointerId
  originX = event.clientX
  originY = event.clientY
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)

  let step = 0
  holdTimeout = setInterval(() => {
    step++
    hold_progress.value = Math.min(100, (step / totalSteps) * 100)
    if (step >= totalSteps) {
      stopInterval()
      isCompleted.value = true
      emits('hold')
    }
  }, interval)
}

function handleButtonMove(event: PointerEvent) {
  if (!isHolding.value || isCompleted.value)
    return

  const dx = event.clientX - originX
  const dy = event.clientY - originY
  if (Math.hypot(dx, dy) > DRAG_TOLERANCE)
    cancelHold()
}

function handleButtonUp(event: PointerEvent) {
  if (pointerId !== null)
    (event.currentTarget as HTMLElement).releasePointerCapture(pointerId)
  cancelHold()
}

function handleWindowBlur() {
  cancelHold()
}

function cancelHold() {
  stopInterval()
  isHolding.value = false
  isCompleted.value = false
  hold_progress.value = 0
  pointerId = null
}

function stopInterval() {
  if (holdTimeout) {
    clearInterval(holdTimeout)
    holdTimeout = null
  }
}

onBeforeUnmount(() => {
  cancelHold()
  window.removeEventListener('blur', handleWindowBlur)
})

window.addEventListener('blur', handleWindowBlur)
</script>

<template>
  <button
    type="button"
    class="relative w-fit h-fit grid grid-cols-1 grid-rows-1 self-center rounded-xl overflow-hidden bg-light-50/25 focus:outline-none focus:ring-0"
    @pointerdown="handleButtonDown"
    @pointermove="handleButtonMove"
    @pointerup="handleButtonUp"
    @pointercancel="cancelHold"
  >
    <span class="col-start-1 col-span-1 row-start-1 row-span-1 z-10 self-center px-4 py-3 uppercase font-semibold tracking-wide text-light-50">
      {{ text.toLowerCase() }}
    </span>
    <Motion
      as="div"
      :initial="{ width: '0%' }"
      :animate="{ width: `${hold_progress}%` }"
      :transition="{ duration: 0 }"
      :class="progressClass"
      class="col-start-1 col-span-1 row-start-1 row-span-1 h-full pointer-events-none"
    />
  </button>
</template>
