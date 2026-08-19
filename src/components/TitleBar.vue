<script setup lang="ts">
import type { Component } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { markRaw, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCountdownStore } from '~/stores'
import CloseIcon from './icons/CloseIcon.vue'
import MinimizeIcon from './icons/MinimizeIcon.vue'
import RefreshIcon from './icons/RefreshIcon.vue'
import SettingIcon from './icons/SettingIcon.vue'

const appWindow = getCurrentWindow()
const countdownStore = useCountdownStore()

const isMaximize = ref<boolean>(false)
const buttons = ref<Array<{
  icon: Component
  class: string
  title: string
  click: (event: MouseEvent) => void
}>>([
      {
        icon: markRaw(MinimizeIcon),
        title: 'minimize',
        class: 'hover:bg-soft-blue-300/25',
        click: (_event: MouseEvent) => {
          appWindow.minimize()
        },
      },
      {
        icon: markRaw(CloseIcon),
        title: 'close',
        class: 'hover:bg-red-500',
        click: (_event: MouseEvent) => {
          appWindow.hide()
        },
      },
    ])
</script>

<template>
  <ul
    data-tauri-drag-region
    class="w-full h-8 z-50 flex-none flex justify-end items-center select-none bg-dark-950 text-light-50"
  >
    <li class="w-fit h-full hover:bg-soft-blue-300/25">
      <button
        type="button"
        name="restart"
        title="restart"
        :tabindex="-1"
        class="w-8 h-full place-items-center fill-light-50 focus:outline-none focus:ring-0 not-disabled:active:scale-90"
        @click="countdownStore.restartToken++"
      >
        <RefreshIcon class="size-5" />
      </button>
    </li>
    <li class="w-fit h-full mr-auto hover:bg-soft-blue-300/25">
      <RouterLink
        :to="{ name: 'setting' }"
        :tabindex="-1"
        name="settings"
        title="settings"
        class="w-8 h-full flex justify-center items-center fill-light-50 focus:outline-none focus:ring-0 not-disabled:active:scale-90"
      >
        <SettingIcon class="size-5" />
      </RouterLink>
    </li>
    <li
      v-for="button, i of buttons"
      :key="i"
      :class="button.class"
      class="h-full"
    >
      <button
        type="button"
        :name="button.title"
        :title="button.title"
        :tabindex="-1"
        class="w-8 h-full place-items-center focus:outline-none focus:ring-0 not-disabled:active:scale-90"
        @click="button.click"
      >
        <component
          :is="button.icon"
          v-if="button.title === 'maximize'"
          :is-maximize="isMaximize"
          class="size-4 fill-light-50"
        />
        <component
          :is="button.icon"
          v-else
          class="size-5 fill-light-50"
        />
      </button>
    </li>
  </ul>
</template>
