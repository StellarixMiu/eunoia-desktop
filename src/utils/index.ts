import type { Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { ref, watch } from 'vue'
import { logger } from './Logger'

interface NumberStorageData {
  key: string
  type: 'u8' | 'u32'
  default: number
}

interface StringStorageData {
  key: string
  default: string
}

interface BooleanStorageData {
  key: string
  default: boolean
}

type StorageData = NumberStorageData | StringStorageData | BooleanStorageData

type SupportedTypes = 'u8' | 'u32' | 'bool' | 'string'

interface LoadMapEntry<T> {
  key: string
  type: SupportedTypes
  ref: Ref<T>
}

function useStorage(data: NumberStorageData): Ref<number>
function useStorage(data: BooleanStorageData): Ref<boolean>
function useStorage(data: StringStorageData): Ref<string>
function useStorage(data: StorageData): Ref<any> {
  const { key, default: default_value } = data as any
  const stored = ref(default_value)
  let last_remote_value = default_value

  const getMethod = (() => {
    if (typeof default_value === 'number')
      return `get_${(data as NumberStorageData).type}_state`
    if (typeof default_value === 'boolean')
      return 'get_bool_state'
    return 'get_string_state'
  })()
  const setMethod = getMethod.replace('get', 'set')

  invoke<typeof default_value>(getMethod, { key })
    .then((value) => {
      stored.value = value
      last_remote_value = value
    })
    .catch(err => logger.error(`[ERROR] Failed to get ${key}`, err))

  watch(stored, (value) => {
    if (value !== last_remote_value) {
      const isSucceed = invoke<boolean>(setMethod, { key, value }).catch(err => logger.error(`[ERROR] Failed to set ${key}`, err))
      if (!isSucceed)
        logger.error(`[ERROR] Failed to set ${key}`)
    }
  })

  listen<{ key: string, value: any }>('data_changed', (event) => {
    if (event.payload.key === key) {
      last_remote_value = event.payload.value
      stored.value = last_remote_value
    }
  })

  return stored
}

async function loadTauriState(map: LoadMapEntry<any>[]) {
  const promises = map.map(({ key, type }) =>
    invoke(`get_${type}_state`, { key }),
  )

  const results = await Promise.all(promises)

  results.forEach((value, i) => {
    map[i].ref.value = value
  })
}

function useDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

function useSleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function useDelayExecution(fn: () => void, ms: number): Promise<void> {
  await useSleep(ms)
  fn()
}

export {
  loadTauriState,
  useDebounce,
  useDelayExecution,
  useSleep,
  useStorage,
}
export * from './Logger'
