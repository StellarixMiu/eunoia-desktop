import type { Component, Ref } from 'vue'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import CoffeeIcon from '~/components/icons/CoffeeIcon.vue'
import FocusIcon from '~/components/icons/FocusIcon.vue'
import InactiveIcon from '~/components/icons/InactiveIcon.vue'
import YogaIcon from '~/components/icons/YogaIcon.vue'
import { useStorage } from '~/utils'

const useMainStore = defineStore('main', () => {
  const isFirstOpen = useStorage({
    key: 'is_first_open',
    default: true,
  })
  const total_session = useStorage({
    key: 'total_session',
    type: 'u8',
    default: 0,
  })
  const focus_session = useStorage({
    key: 'focus_session',
    type: 'u8',
    default: 0,
  })
  const short_break = useStorage({
    key: 'short_break',
    type: 'u8',
    default: 0,
  })
  const long_break = useStorage({
    key: 'long_break',
    type: 'u8',
    default: 0,
  })
  const running_session = useStorage({
    key: 'running_session',
    type: 'u8',
    default: total_session.value,
  })

  const state = useStorage({
    key: 'state',
    default: 'INACTIVE',
  }) as Ref<'FOCUS' | 'SHORT' | 'LONG' | 'INACTIVE', 'FOCUS' | 'SHORT' | 'LONG' | 'INACTIVE'>

  const IconState = computed<Component>(() => state.value === 'FOCUS' ? FocusIcon : state.value === 'SHORT' ? CoffeeIcon : state.value === 'LONG' ? YogaIcon : InactiveIcon)
  const stateIndicator = computed<string>(() => ['SHORT', 'LONG'].includes(state.value) ? `${state.value} Break` : `${state.value}`)

  const long_sound = new Audio('/happy-bell-tone.wav')
  const short_sound = new Audio('/urgent-simple-tone.wav')

  long_sound.load()
  short_sound.load()

  function playAudioAsync(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      audio.currentTime = 0
      audio.play().catch(reject)
      audio.onended = () => resolve()
    })
  }

  async function playSound(type: 'LONG' | 'SHORT', volume: number = 1) {
    switch (type) {
      case 'LONG':
        long_sound.volume = volume
        await playAudioAsync(long_sound)
        break
      case 'SHORT':
        short_sound.volume = volume
        await playAudioAsync(short_sound)
        break
    }
  }

  return {
    isFirstOpen,
    total_session,
    focus_session,
    short_break,
    long_break,
    state,
    running_session,
    IconState,
    stateIndicator,
    playSound,
  }
})

export { useMainStore }
