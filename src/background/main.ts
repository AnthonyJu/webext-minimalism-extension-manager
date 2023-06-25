import browser, { storage } from 'webextension-polyfill'

// 当插件被安装时打开扩展options页面
browser.runtime.onInstalled.addListener(() => {
  browser.runtime.openOptionsPage()
})

let tabs: browser.Tabs.Tab[] = []

// 监听标签页的开启和关闭
browser.tabs.onCreated.addListener((tab) => {
  tabs.push(tab)
  setExtEnabled(tab, true)
})
browser.tabs.onRemoved.addListener((tabId) => {
  const removedTab = tabs.find(tab => tab.id === tabId)
  if (removedTab)
    setExtEnabled(removedTab, false)
  tabs = tabs.filter(tab => tab.id !== tabId)
})

// 根据规则设置扩展的启用状态
async function setExtEnabled(tab: browser.Tabs.Tab, enabled: boolean) {
  const rules = (await storage.local.get('ext-rules'))['ext-rules']
  if (rules) {
    const extRules = JSON.parse(rules) as { id: number; match: string; extIds: string[] }[]
    extRules.forEach((rule) => {
      const matchList = rule.match.split(',')
      const isMatch = matchList.some(match => tab.pendingUrl?.startsWith(match))
      if (isMatch) {
        rule.extIds.forEach((extId) => {
          browser.management.setEnabled(extId, enabled)
        })
      }
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
