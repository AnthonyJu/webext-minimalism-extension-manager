import type { Management } from 'webextension-polyfill'

export {}

declare global {

  interface ExtRule {
    id: number
    match: string
    extIds: string[]
  }
  
  interface Ext extends Management.ExtensionInfo {
    _icon: string
  }
  
  interface ExtGroup {
    id: number
    name: string
    exts: Ext[]
  }
}  
