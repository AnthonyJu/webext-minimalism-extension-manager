import browser from 'webextension-polyfill'

// 当插件被安装时打开扩展options页面
browser.runtime.onInstalled.addListener(() => {
  browser.runtime.openOptionsPage()
})
