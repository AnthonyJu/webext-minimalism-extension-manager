<template>
  <main class="flex flex-col text-center py-10 px-4 justify-center items-center">
    <div class="flex justify-center items-center">
      <img src="../assets/icon.svg" class="w-24px" alt="extension icon">
      <span class="ml-6px text-16px dark:text-light">Extension Manager（极简）</span>
    </div>

    <div class="mt-5 toggle-box">
      <div class="toggleWrapper">
        <input id="dn" type="checkbox" class="dn" :checked="isDark" @change="isDark = !isDark">
        <label for="dn" class="toggle">
          <span class="toggle__handler">
            <span class="crater crater--1" />
            <span class="crater crater--2" />
            <span class="crater crater--3" />
          </span>
          <span class="star star--1" />
          <span class="star star--2" />
          <span class="star star--3" />
          <span class="star star--4" />
          <span class="star star--5" />
          <span class="star star--6" />
        </label>
      </div>
    </div>

    <div class="mt-6 mb-2 text-14px dark:text-light">
      插件排序方式
    </div>
    <div class="container">
      <div class="tabs">
        <input id="radio-1" v-model="extOrder" type="radio" name="tabs" value="0">
        <label class="tab" for="radio-1">激活优先</label>
        <input id="radio-2" v-model="extOrder" type="radio" name="tabs" value="1">
        <label class="tab" for="radio-2">默认排序</label>
        <input id="radio-3" v-model="extOrder" type="radio" name="tabs" value="2">
        <label class="tab" for="radio-3">手动排序</label>
        <span class="glider" />
      </div>
    </div>
    <div class="flex mt-8">
      <a
        href="https://github.com/AnthonyJu/webext-simple-extension-manager "
        target="_blank"
        class="flex text-16px items-center color-#409eff"
      >
        <span>Check more in GitHub</span>
        <carbon-logo-github class="ml-3px" />
      </a>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { extOrder } from '../logic/order'
import { extTheme } from '../logic/dark'

const isDark = useDark()
watchEffect(() => {
  extTheme.value = isDark.value ? 'dark' : 'light'
})
</script>

<style>
html.dark {
  background-color: #222;
}

.toggle-box {
  transform: scale(0.75);
}
.toggle-box .toggleWrapper input {
  display: none;
}

.toggle-box .toggle {
  cursor: pointer;
  display: inline-block;
  position: relative;
  width: 90px;
  height: 50px;
  background-color: #83d8ff;
  border-radius: 84px;
  transition: background-color 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box .toggle:before {
  content: 'Light';
  position: absolute;
  left: -50px;
  top: 15px;
  font-size: 18px;
}

.toggle-box .toggle:after {
  content: 'Dark';
  position: absolute;
  right: -50px;
  top: 15px;
  font-size: 18px;
  color: #83d8ff;
}

.toggle-box .toggle__handler {
  display: inline-block;
  position: relative;
  z-index: 1;
  top: 3px;
  left: 3px;
  width: 44px;
  height: 44px;
  background-color: #ffcf96;
  border-radius: 50px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
  transition: all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: translate(-22px, 0);
}

.toggle__handler .crater {
  position: absolute;
  background-color: #e8cda5;
  opacity: 0;
  transition: opacity 200ms ease-in-out;
  border-radius: 100%;
}

.toggle-box .toggle__handler .crater--1 {
  top: 18px;
  left: 10px;
  width: 4px;
  height: 4px;
}

.toggle-box .toggle__handler .crater--2 {
  top: 28px;
  left: 22px;
  width: 6px;
  height: 6px;
}

.toggle-box .toggle__handler .crater--3 {
  top: 10px;
  left: 25px;
  width: 8px;
  height: 8px;
}

.toggle-box .star {
  position: absolute;
  background-color: #fff;
  transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  border-radius: 50%;
}

.toggle-box .star--1 {
  top: 10px;
  left: 35px;
  z-index: 0;
  width: 30px;
  height: 3px;
}

.toggle-box .star--2 {
  top: 18px;
  left: 28px;
  z-index: 1;
  width: 30px;
  height: 3px;
}

.toggle-box .star--3 {
  top: 27px;
  left: 40px;
  z-index: 0;
  width: 30px;
  height: 3px;
}

.toggle-box .star--4, .star--5, .star--6 {
  opacity: 0;
  transition: all 300ms 0 cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box .star--4 {
  top: 16px;
  left: 11px;
  z-index: 0;
  width: 2px;
  height: 2px;
  transform: translate3d(3px, 0, 0);
}

.toggle-box .star--5 {
  top: 32px;
  left: 17px;
  z-index: 0;
  width: 3px;
  height: 3px;
  transform: translate3d(3px, 0, 0);
}

.toggle-box .star--6 {
  top: 36px;
  left: 28px;
  z-index: 0;
  width: 2px;
  height: 2px;
  transform: translate3d(3px, 0, 0);
}

.toggle-box input:checked + .toggle {
  background-color: #749dd6;
}

.toggle-box input:checked + .toggle:before {
  color: #749ed7;
}

.toggle-box input:checked + .toggle:after {
  color: #fff;
}

.toggle-box input:checked + .toggle .toggle__handler {
  background-color: #ffe5b5;
  transform: translate3d(18px, 0, 0) rotate(0);
}

.toggle-box input:checked + .toggle .toggle__handler .crater {
  opacity: 1;
}

.toggle-box input:checked + .toggle .star--1 {
  width: 2px;
  height: 2px;
}

.toggle-box input:checked + .toggle .star--2 {
  width: 4px;
  height: 4px;
  transform: translate3d(-5px, 0, 0);
}

.toggle-box input:checked + .toggle .star--3 {
  width: 2px;
  height: 2px;
  transform: translate3d(-7px, 0, 0);
}

.toggle-box input:checked + .toggle .star--4, input:checked + .toggle .star--5, input:checked + .toggle .star--6 {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.toggle-box input:checked + .toggle .star--4 {
  transition: all 300ms 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box input:checked + .toggle .star--5 {
  transition: all 300ms 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box input:checked + .toggle .star--6 {
  transition: all 300ms 400ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.dark .tabs{
  background-color: #749dd6;
}

.tabs {
  display: flex;
  position: relative;
  background-color: #83d8ff;
  box-shadow: 0 0 1px 0 rgba(24, 94, 224, 0.15), 0 6px 12px 0 rgba(24, 94, 224, 0.15);
  padding: 0.75rem;
  border-radius: 99px;
}

.tabs * {
  z-index: 2;
}

.container input[type="radio"] {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 90px;
  font-size: .8rem;
  color: #fff;
  font-weight: 500;
  border-radius: 99px;
  cursor: pointer;
  transition: color 0.15s ease-in;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: center;
  width: .8rem;
  height: .8rem;
  position: absolute;
  top: 10px;
  left: 30%;
  font-size: 10px;
  margin-left: 0.75rem;
  border-radius: 50%;
  margin: 0px;
  background-color: #e6eef9;
  transition: 0.15s ease-in;
}

.container input[type="radio"]:checked + label {
  color: #28a6ff;
}

.container input[type="radio"]:checked + label > .notification {
  background-color: #185ee0;
  color: #fff;
  margin: 0px;
}

.container input[id="radio-1"]:checked ~ .glider {
  transform: translateX(0);
}

.container input[id="radio-2"]:checked ~ .glider {
  transform: translateX(100%);
}

.container input[id="radio-3"]:checked ~ .glider {
  transform: translateX(200%);
}

.glider {
  position: absolute;
  display: flex;
  height: 30px;
  width: 90px;
  background-color: #e6eef9;
  z-index: 1;
  border-radius: 99px;
  transition: 0.25s ease-out;
}

@media (max-width: 700px) {

  .tabs {
    transform: scale(0.6);
  }
}
</style>
