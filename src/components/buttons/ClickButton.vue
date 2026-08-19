<script setup lang="ts">
import { Motion } from 'motion-v'
import { ref } from 'vue'

defineProps<{
  text: string
  rippleClass: HTMLButtonElement['className']
}>()

const emits = defineEmits<{
  click: []
}>()

const ripples = ref<Array<{ x: number, y: number, id: number }>>([])
let ripple_counter = 0

function handleClick(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const id = ripple_counter++

  ripples.value.push({ x, y, id })

  emits('click')

  setTimeout(() => {
    ripples.value = ripples.value.filter(ripple => ripple.id !== id)
  }, 600)
}
</script>

<template>
  <button
    type="button"
    class="relative w-fit h-fit grid grid-cols-1 grid-rows-1 justify-center place-items-center self-center rounded-xl overflow-hidden bg-light-50/25 focus:outline-none focus:ring-0"
    @click="handleClick"
  >
    <span class="z-10 self-center px-4 py-3 uppercase font-semibold tracking-wide text-light-50">
      {{ text.toLowerCase() }}
    </span>
    <Motion
      v-for="ripple in ripples"
      :key="ripple.id"
      as="span"
      :style="{
        top: `${ripple.y - 40}px`,
        left: `${ripple.x - 40}px`,
      }"
      :initial="{
        scale: 0,
        opacity: 1 }"
      :animate="{
        scale: 3,
        opacity: 0.25,
      }"
      :transition="{
        duration: 0.8,
        easing: 'ease-out',
      }"
      :class="rippleClass"
      class="absolute w-20 h-20 rounded-full pointer-events-none"
    />
  </button>
</template>
