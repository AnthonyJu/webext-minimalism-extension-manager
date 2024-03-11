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
  // 过滤掉自身
  exts = exts.filter(item => item.name !== 'Extension Manager（极简）')
  // 如果没有分组，创建默认分组
  if (extGroups.value.length === 0) {
    extGroups.value = [
      {
        id: 0,
        enabled: exts.some(ext => ext.enabled),
        name: '默认分组',
        exts,
      },
    ]
  }
  else {
    // 如果有分组，替换对应的插件
    extGroups.value.forEach((group) => {
      group.exts = group.exts.map((item) => {
        const ext = exts.find(ext => ext.id === item.id)
        return {
          ...(ext ?? item),
          _icon: getIcon(ext?.icons),
        }
      })
      // 如果所有的插件开启状态都是false，则group的开启状态也是false
      group.enabled = group.exts.some(ext => ext.enabled)
    })
  }
  // 计算所有分组的长度
  const extsNum = extGroups.value.reduce((prev, cur) => {
    return prev + cur.exts.length
  }, 0)
  // 如果分组的长度和插件的长度不一致，说明有新安装或者卸载的插件
  if (exts.length !== extsNum) {
    // 找到新安装的插件
    const newExt = exts.filter((item) => {
      return !extGroups.value.some(group => group.exts.some(ext => ext.id === item.id))
    })
    if (newExt.length > 0) {
      const defaultGroup = extGroups.value.find(item => item.id === 0)!
      defaultGroup.exts.push(...newExt.map((item) => {
        return {
          ...item,
          _icon: getIcon(item.icons),
        }
      }))
    }
    // 找到卸载的插件
    const removeExt = extGroups.value.reduce((prev, cur) => {
      return prev.concat(cur.exts)
    }, [] as Ext[]).filter((item) => {
      return !exts.some(ext => ext.id === item.id)
    })
    if (removeExt.length > 0) {
      extGroups.value.forEach((group) => {
        group.exts = group.exts.filter(item => !removeExt.some(ext => ext.id === item.id))
      })
    }
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
