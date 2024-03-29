import browser, { storage } from 'webextension-polyfill'

// // 当插件被安装时打开扩展options页面
// browser.runtime.onInstalled.addListener(() => {
//   browser.runtime.openOptionsPage()
// })

interface TabWithExts extends browser.Tabs.Tab {
  exts?: string[]
}

// 保存所有打开的标签页
const allOpenTabs: TabWithExts[] = []

// 监听标签页的关闭
browser.tabs.onRemoved.addListener((tabId) => {
  // 获取关闭的标签页
  const removedTab = allOpenTabs.find(openTab => openTab.id === tabId)
  if (removedTab) setExtEnabled(removedTab, false)
})

// 监听标签页的更新以及开启
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // 判断是否是新开启的标签页
    const replacedTab = allOpenTabs.find(openTab => openTab.id === tabId)
    // 不管是新开启还是更新的标签页都要重新设置扩展的启用状态（需要优先处理）
    await setExtEnabled(tab, true)
    // 如果不是新开启的标签页, 则关闭之前的标签页使用的扩展
    if (replacedTab) setExtEnabled(replacedTab, false)
  }
})

// 根据规则设置扩展的启用状态
async function setExtEnabled(tab: TabWithExts, newTab: boolean) {
  if (newTab) {
    // 获取所有规则
    const rules = (await storage.local.get('ext-rules'))['ext-rules']
    // 如果没有规则则不处理
    if (!rules) return

    // 将规则转换为对象
    const extRules = JSON.parse(rules) as { id: number; match: string; extIds: string[] }[]
    // 如果没有规则则不处理
    if (!extRules.length) return

    // 保存当前标签页所用到的扩展id
    const exts: string[] = []
    // 遍历规则
    extRules.forEach((rule) => {
      const matchList = rule.match.split(',')
      // 判断当前标签页是否匹配规则
      const isMatch = matchList.some(match => tab.url?.startsWith(match))
      // 保存当前标签页所用到的扩展id
      if (isMatch) exts.push(...rule.extIds)
    })

    // 循环开启标签页使用的扩展
    exts!.forEach((extId) => {
      // 判断其他标签页是否已经使用该扩展
      const hasOtherMatch = allOpenTabs.some((otherTab) => {
        return otherTab.exts!.includes(extId)
      })
      // 如果没有其他标签页使用该扩展则开启
      if (!hasOtherMatch) browser.management.setEnabled(extId, true)
    })

    // 保存当前标签页
    allOpenTabs.push({ ...tab, exts: [...new Set(exts)] })
  }
  else {
    // 从allOpenTabs中移除标签页
    allOpenTabs.splice(allOpenTabs.indexOf(tab), 1)

    // 循环关闭标签页的扩展
    tab.exts!.forEach((extId) => {
      // 判断其他标签页是否还在使用该扩展
      const noOtherMatch = allOpenTabs.every((otherTab) => {
        return otherTab.exts!.every(otherExtId => otherExtId !== extId)
      })
      // 如果没有其他标签页使用该扩展则关闭
      if (noOtherMatch) browser.management.setEnabled(extId, false)
    })
  }
}

// 默认关闭所有规则中的扩展
(async function disableAllExt() {
  const rules = (await storage.local.get('ext-rules'))['ext-rules']
  if (rules) {
    const extRules = JSON.parse(rules) as { id: number; match: string; extIds: string[] }[]
    extRules.forEach((rule) => {
      rule.extIds.forEach((extId) => {
        browser.management.setEnabled(extId, false)
      })
    })
  }
})()
