<template>
  <main class="flex flex-col w-280px justify-center items-center dark:bg-dark dark:text-light">
    <div class="cursor-pointer flex mt-2 justify-center items-center" @click="openOption">
      <img src="../assets/icon.svg" w-22px>
      <p ml-6px text-12px>
        Extension Manager（极简）
      </p>
    </div>

    <div class="bg-gray-500 h-1px mt-2 w-full" />

    <div id="exts" class="w-full max-h-458px overflow-auto">
      <template v-if="extOrder === '3'">
        <div v-for="group in extGroups" :key="group.id">
          <div class="m-10px pb-4px flex font-500 items-center justify-between text-14px border-b border-gray">
            {{ group.name }}
            <GroupSwitch :group="group" />
          </div>
          <Ext v-for="ext in group.exts" :key="ext.id" :ext-info="ext" />
        </div>
      </template>
      <template v-else>
        <Ext v-for="ext in extsList" :key="ext.id" :ext-info="ext" />
      </template>
    </div>

    <div class="bg-gray-500 h-1px w-full" />
    <button class="w-full p-2 hover:text-#4b9cfb" @click="openAddons">
      扩展管理
    </button>

    <div class="bg-gray-500 h-1px w-full" />
    <button class="w-full p-2 hover:text-#4b9cfb" @click="openExtStore">
      插件市场
    </button>
  </main>
</template>

<script setup lang="ts">
// import { ElScrollbar } from 'element-plus'
import type { Management } from 'webextension-polyfill'
import Sortable from 'sortablejs'
import { storage } from 'webextension-polyfill'
import { extGroups, extOrder, getIcon, orderExtList, setDefaultGroup, themeIsDark } from '~/logic/storage'

interface Ext extends Management.ExtensionInfo {
  _icon: string
}
// 切换主题
watchEffect(() => {
  document.documentElement.className = themeIsDark.value ? 'dark' : 'light'
})

let sortable: Sortable | null = null
// 展示的扩展
const extsList = ref<Ext[]>([])

onMounted(() => {
  const element = document.getElementById('exts')
  if (!element) return
  sortable = Sortable.create(element, {
    animation: 150,
    disabled: extOrder.value !== '2',
    handle: '.drag-point',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt
      const ext = orderExtList.value[oldIndex!]
      orderExtList.value.splice(oldIndex!, 1)
      orderExtList.value.splice(newIndex!, 0, ext)
    },
  })
})

// 切换扩展排序方式
watch(extOrder, (value) => {
  // 根据排序方式设置是否可拖拽
  sortable?.option('disabled', value !== '2')
  // 获取所有扩展
  getAllExt()
},
{
  immediate: true,
})

// 当有新的扩展安装时，重新获取扩展列表
browser.management.onInstalled.addListener(getAllExt)

// 当有扩展被卸载时，重新获取扩展列表
browser.management.onUninstalled.addListener(getAllExt)

// 当有扩展被启用或禁用时，重新获取扩展列表
browser.management.onEnabled.addListener(getAllExt)
browser.management.onDisabled.addListener(getAllExt)

// 取消监听
onUnmounted(() => {
  browser.management.onInstalled.removeListener(getAllExt)
  browser.management.onUninstalled.removeListener(getAllExt)
  browser.management.onEnabled.removeListener(getAllExt)
  browser.management.onDisabled.removeListener(getAllExt)
})

// 获取所有扩展
function getAllExt() {
  browser.management.getAll().then(async (res) => {
    // 循环获取ext信息
    res.forEach(async (item) => {
      item = await browser.management.get(item.id)
    })

    const newRes: Ext[] = res.map((item) => {
      return {
        ...item,
        _icon: getIcon(item.icons),
      }
    })

    // 默认排序
    if (extOrder.value === '1') {
      // 根据插件名称排序,中文放在后面,不区分大小写
      extsList.value = newRes.sort((a, b) => {
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'accent' })
      })
    }
    // 激活优先、手动排序
    else {
      // 先获取激活的扩展，再获取未激活的扩展，再进行排序，再进行合并
      const activeExts = newRes.filter(ext => ext.enabled)
      const inactiveExts = newRes.filter(ext => !ext.enabled)

      activeExts.sort((a, b) => {
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'accent' })
      })
      inactiveExts.sort((a, b) => {
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'accent' })
      })

      // 激活优先
      if (extOrder.value === '0') {
        extsList.value = activeExts.concat(inactiveExts)
        orderExtList.value = activeExts.concat(inactiveExts)
      }
      else {
        // 获取手动排序的扩展, 必须使用await，否则会出现偶发性的排序错误
        const orderList = (await storage.local.get('orderExtList')).orderExtList
        // 手动排序为空时
        if (JSON.parse(orderList).length === 0) {
          extsList.value = activeExts.concat(inactiveExts)
          orderExtList.value = activeExts.concat(inactiveExts)
          return
        }

        // 过滤掉已经卸载的扩展
        orderExtList.value = orderExtList.value.filter(ext => newRes.some(item => item.id === ext?.id))
        // 增加新安装的扩展
        newRes.forEach((ext) => {
          if (!orderExtList.value.some(item => item.id === ext.id))
            orderExtList.value.unshift(ext)
        })
        // 根据存储的顺序，替换对应最新数据
        extsList.value = orderExtList.value.map(item => newRes.find(ext => ext.id === item.id)!)
      }
    }

    // 如果有新安装的插件，添加到默认分组
    setDefaultGroup(newRes)
  })
}

// 打开扩展option
function openOption() {
  browser.runtime.openOptionsPage()
}

// 打开扩展页面
function openAddons() {
  // 当前浏览器是Edge
  if (/Edg\//.test(navigator.userAgent))
    browser.tabs.create({ url: 'edge://extensions/' })

  // 当前浏览器是Chrome
  else if (/Chrome\//.test(navigator.userAgent))
    browser.tabs.create({ url: 'chrome://extensions/' })

  // 当前浏览器是Firefox
  else if (/Firefox\//.test(navigator.userAgent))
    browser.tabs.create({ url: 'about:addons' })

  // 当前浏览器是Opera
  else if (/OPR\//.test(navigator.userAgent))
    browser.tabs.create({ url: 'opera://extensions/' })

  // 当前浏览器是Safari
  else if (/Safari\//.test(navigator.userAgent))
    browser.tabs.create({ url: 'safari://extensions/' })

  // 当前浏览器是其他浏览器
  else browser.tabs.create({ url: 'about:addons' })
}

// 打开插件市场
function openExtStore() {
  // 当前浏览器是Edge
  if (/Edg\//.test(navigator.userAgent)) {
    browser.tabs.create({
      url: 'https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home/',
    })
  }
  // 当前浏览器是Chrome
  else if (/Chrome\//.test(navigator.userAgent)) {
    browser.tabs.create({ url: 'https://chrome.google.com/webstore/category/extensions' })
  }
  // 当前浏览器是Firefox
  else if (/Firefox\//.test(navigator.userAgent)) {
    browser.tabs.create({ url: 'https://addons.mozilla.org/zh-CN/firefox/' })
  }
  // 当前浏览器是Opera
  else if (/OPR\//.test(navigator.userAgent)) {
    browser.tabs.create({ url: 'https://addons.opera.com/zh-cn/extensions/' })
  }
  // 当前浏览器是Safari
  else if (/Safari\//.test(navigator.userAgent)) {
    browser.tabs.create({ url: 'https://safari-extensions.apple.com/' })
  }
  // 当前浏览器是其他浏览器
  else {
    browser.tabs.create({ url: 'https://chrome.google.com/webstore/category/extensions' })
  }
}
</script>

<style>
*{
  user-select: none;
}

html.dark {
  color-scheme: dark;
}

.plane-switch {
  --dot: #fff;
  --street: #6b6d76;
  --street-line: #a8aab4;
  --street-line-mid: #c0c2c8;
  --sky-1: #60a7fa;
  --sky-2: #2f8efc;
  --light-1: rgba(255, 233, 0, 1);
  --light-2: rgba(255, 233, 0, 0.3);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.plane-switch input {
  display: none;
}

.plane-switch input + div {
  position: relative;
  overflow: hidden;
  width: 37px;
  height: 17px;
  padding: 1px;
  border-radius: 13px;
  background: linear-gradient(
      90deg,
      var(--street) 0%,
      var(--street) 25%,
      var(--sky-1) 75%,
      var(--sky-2) 100%
    )
    left var(--p, 0%) top 0;
  background-position-x: var(--p, 0%);
  background-size: 400% auto;
  transition: background-position 0.6s;
}

.plane-switch input + div:before,
.plane-switch input + div:after {
  content: '';
  display: block;
  position: absolute;
  transform: translateX(var(--s, 0));
  transition: transform 0.3s;
}

.plane-switch input + div:before {
  width: 42px;
  right: 2px;
  top: 4px;
  height: 1px;
  background: var(--street-line);
  box-shadow: 0 16px 0 0 var(--street-line);
}

.plane-switch input + div:after {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  left: 23px;
  top: 1px;
  -webkit-animation: lights2 2s linear infinite;
  animation: lights2 2s linear infinite;
  box-shadow: inset 0 0 0 2px var(--light-1), 0 21px 0 var(--light-1), 8px 0 0 var(--light-2),
    8px 21px 0 var(--light-2), 16px 0 0 var(--light-2), 16px 21px 0 var(--light-2);
}

.plane-switch input + div span {
  display: block;
  position: absolute;
}

.plane-switch input + div span.street-middle {
  top: 12px;
  left: 21px;
  width: 3px;
  height: 1px;
  transform: translateX(var(--s, 0));
  background: var(--street-line-mid);
  box-shadow: 5px 0 0 var(--street-line-mid), 10px 0 0 var(--street-line-mid),
    15px 0 0 var(--street-line-mid), 20px 0 0 var(--street-line-mid),
    25px 0 0 var(--street-line-mid);
  transition: transform 0.3s;
}

.plane-switch input + div span.cloud {
  width: 12px;
  height: 4px;
  border-radius: 2px;
  background: #fff;
  position: absolute;
  top: var(--ct, 6px);
  left: 100%;
  opacity: var(--co, 0);
  transition: opacity 0.3s;
  -webkit-animation: clouds2 2s linear infinite var(--cd, 0s);
  animation: clouds2 2s linear infinite var(--cd, 0s);
}

.plane-switch input + div span.cloud:before,
.plane-switch input + div span.cloud:after {
  content: '';
  position: absolute;
  transform: translateX(var(--cx, 0));
  border-radius: 50%;
  width: var(--cs, 5px);
  height: var(--cs, 5px);
  background: #fff;
  bottom: 1px;
  left: 1px;
}

.plane-switch input + div span.cloud:after {
  --cs: 6px;
  --cx: 4px;
}

.plane-switch input + div span.cloud.two {
  --ct: 14px;
  --cd: 1s;
  opacity: var(--co-2, 0);
}

.plane-switch input + div div {
  display: table;
  position: relative;
  z-index: 1;
  padding: 2px;
  border-radius: 50%;
  background: var(--dot);
  transform: translateX(var(--x, 0));
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.35, 1.2);
}

.plane-switch input + div div svg {
  width: 11px;
  height: 11px;
  display: block;
  color: var(--c, var(--street));
  transition: color 0.6s;
}

.plane-switch input:checked + div {
  --p: 100%;
  --x: 20px;
  --s: -50px;
  --c: var(--sky-2);
  --co: 0.8;
  --co-2: 0.6;
}

@keyframes lights2 {
  20%,
  30% {
    box-shadow: inset 0 0 0 2px var(--light-2), 0 21px 0 var(--light-2), 8px 0 0 var(--light-1),
      8px 21px 0 var(--light-1), 16px 0 0 var(--light-2), 16px 21px 0 var(--light-2);
  }

  55%,
  65% {
    box-shadow: inset 0 0 0 2px var(--light-2), 0 21px 0 var(--light-2), 8px 0 0 var(--light-2),
      8px 21px 0 var(--light-2), 16px 0 0 var(--light-1), 16px 21px 0 var(--light-1);
  }

  90%,
  100% {
    box-shadow: inset 0 0 0 2px var(--light-1), 0 21px 0 var(--light-1), 8px 0 0 var(--light-2),
      8px 21px 0 var(--light-2), 16px 0 0 var(--light-2), 16px 21px 0 var(--light-2);
  }
}

@keyframes clouds2 {
  97% {
    transform: translateX(-72px);
    visibility: visible;
  }

  98%,
  100% {
    visibility: hidden;
  }

  99% {
    transform: translateX(-72px);
  }

  100% {
    transform: translateX(0);
  }
}
</style>
