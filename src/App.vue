<script setup lang="ts">
import TitleBar from './components/TitleBar.vue'
</script>

<template>
  <div
    :class="{ 'rounded-lg': $route.name !== 'interrupt' }"
    class="fixed top-0 left-0 w-dvw h-dvh flex flex-col font-manrope overflow-hidden select-none"
  >
    <TitleBar
      v-if="!$route.meta.isTransparent && $route.name !== 'interrupt'"
      class="z-50"
    />
    <!-- [ ] ADD GRAINING TEXTURE -->
    <div
      :class="{ 'bg-dark-950': $route.name !== 'interrupt' }"
      class="w-full h-full relative overflow-hidden"
    >
      <RouterView
        v-slot="{ Component }"
      >
        <Transition
          mode="out-in"
          type="transition"
          enter-active-class="transition-all ease-in-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all ease-in-out duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component
            :is="Component"
            :key="$route.fullPath"
          />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>
