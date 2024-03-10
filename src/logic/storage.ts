import type { Management } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'

export const extOrder = useStorageLocal('ext-order', '1', { listenToStorageChanges: true })
export const themeIsDark = useStorageLocal('ext-theme', false, { listenToStorageChanges: true })
export const orderExtList = useStorageLocal<Management.ExtensionInfo[]>('orderExtList', [], {
  listenToStorageChanges: true,
})
export const extRules = useStorageLocal<ExtRule[]>('ext-rules', [], {
  listenToStorageChanges: true,
})
export const extGroups = useStorageLocal<ExtGroup[]>('ext-groups', [], { listenToStorageChanges: true })

// 分组配置
export function setDefaultGroup(exts: Ext[]) {
  if (extGroups.value.length === 0) {
    extGroups.value = [
      {
        id: 0,
        name: '默认分组',
        exts,
      },
    ]
  }
  const defaultGroup = extGroups.value.find(item => item.id === 0)!
  // 如果有新安装的插件，添加到默认分组
  const newExt = exts.filter((item) => {
    return !defaultGroup.exts.some(ext => ext.id === item.id)
  })
  // 找到默认分组
  if (newExt.length > 0) {
    defaultGroup.exts.push(...newExt.map((item) => {
      return {
        ...item,
        _icon: getIcon(item.icons),
      }
    }))
  }
}

// 获取分辨率最大的icon
export function getIcon(icons?: Management.IconInfo[]) {
  if (!icons || icons.length === 0)
    return '/assets/ext-icon.png'

  let max = 0
  let maxIndex = 0
  icons.forEach((item, index) => {
    if (item.size > max && item.size <= 128) {
      max = item.size
      maxIndex = index
    }
  })
  return icons[maxIndex].url
}
