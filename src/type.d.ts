import type { Management } from 'webextension-polyfill'

declare global {
  interface ExtRule {
    id: number
    match: string
    extIds: string[]
  }

  interface Ext extends Management.ExtensionInfo {
    _icon: string
  }

  interface ExtGroupWithoutExts {
    id: number
    name: string
    enabled: boolean
    hide: boolean
    expand: boolean
  }

  interface ExtGroup extends ExtGroupWithoutExts {
    exts: Ext[]
  }
}

export {}
