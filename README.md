<h1 align='center'>WebExtension Minimalism Extension Manager</h1>

<p align='center'>一个受 Vite 支持的 浏览器扩展 极简扩展管理器。只提供简单的管理方式，不搞花里胡哨。</p>

## 特性
    1. 支持扩展启用、禁用、卸载：
       启用与禁用：点击扩展后方的开关即可
       卸载：为保证界面简洁，只需双击扩展图标即可进行卸载
    2. 扩展排序：
       提供三种排序方式：默认排序、激活优先、手动排序（点击扩展图标拖拽进行排序）
    3. 扩展配置界面：
       点击扩展名称即可进入扩展配置界面
    4. 提供与扩展管理相同快捷按钮：管理扩展、扩展商店
       扩展层次无法去固定其他扩展在工具栏（这是真的痛），不然就可以完全隐藏原生扩展管理了
    5. 主题切换：
       提供两种主题：浅色、深色（个人喜欢深色，so）

<p align="center">
<img width="655" src="https://raw.githubusercontent.com/AnthonyJu/static/main/minimalism-extension-manager/light.jpg"><br/>
<img width="655" src="https://raw.githubusercontent.com/AnthonyJu/static/main/minimalism-extension-manager/dark.jpg"><br/>
</p>

## 使用

如果你正在使用Edge浏览器，你可以在 [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/pfiggkflfkhohkmegglgnlgakdbmjdfh)下载它（正在上线中...,可以先使用下面的方式）。

如果你使用的是其他浏览器，你可以[点击下载](https://raw.githubusercontent.com/AnthonyJu/static/main/minimalism-extension-manager/extension.zip)，解压后，在浏览器的扩展页面，打开开发者模式，加载这个文件夹。

你也可以clone这个仓库，运行：
    
```bash
pnpm install
pnpm run build
```
在文件根目录下，你会看到一个 `extension` 文件夹，在浏览器的扩展页面，打开开发者模式，加载这个文件夹。


## 感谢巨人

此扩展的启动模板来自 [Vitesse-webext](https://github.com/antfu/vitesse-webext) ❤️
