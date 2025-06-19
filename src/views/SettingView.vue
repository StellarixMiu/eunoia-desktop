<script setup lang="ts">
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import AddIcon from '~/components/icons/AddIcon.vue'
import ChevronIcon from '~/components/icons/ChevronIcon.vue'
import RemoveIcon from '~/components/icons/RemoveIcon.vue'
import { useMainStore } from '~/stores'

interface SettingSection {
  title: string
  max?: number
}

const mainStore = useMainStore()
const {
  total_session,
  focus_session,
  short_break,
  long_break,
} = storeToRefs(mainStore)

const selected_number_section = ref<SettingSection & { model: Ref<number, number>, additionalText?: string } | null>(null)
const section_tab_index = ref<1 | -1>(1)
const isModalOpen = ref<boolean>(false)

const number_sections = reactive<Array<SettingSection & { model: Ref<number, number>, additionalText?: string }>>([
  {
    title: 'total session',
    model: total_session,
    max: 99,
  },
  {
    title: 'focus session',
    model: focus_session,
    max: 60,
    additionalText: 'min',
  },
  {
    title: 'short break',
    model: short_break,
    max: 60,
    additionalText: 'min',
  },
  {
    title: 'long break',
    model: long_break,
    max: 60,
    additionalText: 'min',
  },
])

function openModal(section: SettingSection & { model: number, additionalText?: string }): void {
  isModalOpen.value = true
  section_tab_index.value = -1
  selected_number_section.value = section
}

function closeModal(_event: MouseEvent) {
  selected_number_section.value = null
  isModalOpen.value = false
}

function changeValue(type: 'RETRACT' | 'ADD', section: SettingSection & { model: number, additionalText?: string }) {
  if (!section
    || !Number.isFinite(section.model)
    || (section.max && section.model >= section.max)
    || (type === 'RETRACT' && section.model <= 1)) {
    return
  }

  switch (type) {
    case 'ADD':
      section.model++
      break
    case 'RETRACT':
      section.model--
      break
  }
}
</script>

<template>
  <div class="w-full h-full pb-8 px-8 flex flex-col text-light-50">
    <div
      :class="{ 'opacity-0': isModalOpen }"
      class="h-9 mt-2 flex-none grid grid-cols-4 grid-rows-1 transition-all ease-in-out duration-500"
    >
      <RouterLink
        :to="{ name: 'home' }"
        :disabled="isModalOpen"
        class="col-start-1 col-span-1 row-start-1 row-span-1 self-center size-9 p-1 rounded-xl bg-light-50/25 fill-light-50 focus:fill-soft-blue-300 focus:bg-soft-blue-300/25 focus:outline-none focus:ring-0 not-disabled:active:scale-90"
      >
        <ChevronIcon class="size-full" />
      </RouterLink>
      <h1 class="col-start-1 col-span-full row-start-1 row-span-1 justify-self-center self-center h-fit text-4xl">
        Settings
      </h1>
    </div>
    <ul
      :class="{ 'opacity-0': isModalOpen }"
      class="w-full h-full flex flex-col justify-end items-start transition-all ease-in-out duration-500"
    >
      <li
        v-for="section, i in number_sections"
        :key="i"
        class="w-full h-12 grid grid-cols-10"
      >
        <h1 class="col-span-7 self-center text-start text-xl capitalize">
          {{ section.title }}
        </h1>
        <div class="col-span-2 self-center flex justify-start items-end">
          <h2 class="w-8 text-start text-2xl font-bold lining-nums">
            {{ section.model.toString().padStart(2, "0") }}
          </h2>
          <span class="text-gray-400 text-lg font-normal">
            {{ section.additionalText }}
          </span>
        </div>
        <button
          type="button"
          :disabled="isModalOpen"
          :tabindex="section_tab_index"
          class="col-start-10 w-full h-full p-0.5 fill-light-50 focus:fill-soft-blue-300 focus:outline-none focus:ring-0 not-disabled:active:scale-90"
          @click="openModal(section)"
        >
          <ChevronIcon class="size-full rotate-180" />
        </button>
      </li>
    </ul>
    <Transition
      type="transition"
      enter-active-class="transition-all ease-in-out duration-500"
      enter-from-class="translate-y-[100%]"
      enter-to-class="-translate-y-[0%]"
      leave-active-class="transition-all ease-in-out duration-500"
      leave-from-class="-translate-y-[0%]"
      leave-to-class="translate-y-[100%]"
    >
      <div
        v-if="isModalOpen"
        class="absolute left-0 bottom-0 w-full h-full pb-8 px-8 flex flex-col rounded-t-xl drop-shadow-xl bg-dark-950"
      >
        <button
          type="button"
          :disabled="!isModalOpen"
          class="size-9 mt-2 p-1 rounded-xl bg-light-50/25 fill-light-50 focus:fill-soft-blue-300 focus:bg-soft-blue-300/25 focus:outline-none focus:ring-0 not-disabled:active:scale-90"
          @click="closeModal"
        >
          <ChevronIcon class="size-full" />
        </button>
        <div
          :class="[selected_number_section ? 'mt-20' : 'mt-8']"
          class="w-full h-full flex flex-col justify-start items-center overflow-hidden"
        >
          <h1 class="h-fit flex-none text-4xl capitalize">
            {{ selected_number_section?.title }}
          </h1>
          <div
            v-if="selected_number_section"
            class="w-full mt-12 flex justify-center items-center gap-12"
          >
            <button
              type="button"
              :disabled="!isModalOpen"
              class="size-10 p-1 rounded-xl bg-light-50/25 fill-light-50 focus:fill-soft-blue-300 focus:bg-soft-blue-300/25 focus:outline-none focus:ring-0"
              @click="changeValue('RETRACT', selected_number_section)"
            >
              <RemoveIcon class="size-full not-disabled:active:scale-90" />
            </button>
            <span class="w-16 h-12 arrow-none text-5xl text-center font-bold lining-nums select-none focus:outline-none focus:ring-0">
              {{ selected_number_section.model }}
            </span>
            <button
              type="button"
              :disabled="!isModalOpen"
              class="size-10 p-1 rounded-xl bg-light-50/25 fill-light-50 focus:fill-soft-blue-300 focus:bg-soft-blue-300/25 focus:outline-none focus:ring-0"
              @click="changeValue('ADD', selected_number_section)"
            >
              <AddIcon class="size-full not-disabled:active:scale-90" />
            </button>
          </div>
          <label
            v-if="selected_number_section && selected_number_section.additionalText"
            class="text-gray-400 text-lg font-normal"
          >
            {{ selected_number_section.additionalText }}
          </label>
        </div>
      </div>
    </Transition>
  </div>
</template>
