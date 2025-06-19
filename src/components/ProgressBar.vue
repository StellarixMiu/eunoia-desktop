<script setup lang="ts">
import { Motion } from 'motion-v'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useMainStore } from '~/stores'

const { runningSecond, totalSecond } = defineProps<{
  totalSecond: number
  runningSecond: number
}>()

const mainStore = useMainStore()
const { state } = storeToRefs(mainStore)

const percentage = computed(() =>
  Math.min(100, (runningSecond / totalSecond) * 100),
)
</script>

<template>
  <div class="relative w-96 h-10 rounded-xl bg-light-50/25">
    <div
      :style="{ width: `${percentage}%` }"
      :class="[state === 'FOCUS' ? 'bg-soft-red-300' : state === 'SHORT' ? 'bg-soft-blue-300' : state === 'LONG' ? 'bg-soft-yellow-200' : 'bg-light-50']"
      class="h-full transition-all rounded-xl ease-in-out"
    />
    <Motion
      as="div"
      :style="{ left: `${percentage}%`, transform: 'translateX(-50%)' }"
      :class="[state === 'FOCUS' ? 'bg-soft-red-300' : state === 'SHORT' ? 'bg-soft-blue-300' : state === 'LONG' ? 'bg-soft-yellow-200' : 'bg-light-50']"
      class="absolute -top-2 left-0 w-2.5 h-14 z-10 rounded-full transition-all ease-in-out border-2 border-dark-950"
    />
  </div>
</template>
