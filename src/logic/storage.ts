import type { Management } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'

interface ExtRule {
  id: number
  match: string
  extIds: string[]
}

export const extOrder = useStorageLocal('ext-order', '1', { listenToStorageChanges: true })
export const themeIsDark = useStorageLocal('ext-theme', false, { listenToStorageChanges: true })
export const orderExtList = useStorageLocal<Management.ExtensionInfo[]>('orderExtList', [], {
  listenToStorageChanges: true,
})
export const extRules = useStorageLocal<ExtRule[]>('ext-rules', [], {
  listenToStorageChanges: true,
})
