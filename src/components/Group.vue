<template>
  <!-- title -->
  <div class="w-635px mt-12 mb-4 px-6px flex items-center justify-between text-16px">
    <ElButton class="opacity-0" type="primary" link>
      新增分组
    </ElButton>
    <div class="dark:text-light">
      分组配置
    </div>
    <ElButton class="relative top-10px" type="primary" link @click="visible = true">
      新增分组
    </ElButton>
  </div>
  <!-- group -->
  <div ref="dragRef" class="group-container flex flex-wrap justify-center gap-10px">
    <div
      v-for="(group, index) in allGroups"
      :key="group.id"
      class="group-item w-300px min-h-105px flex flex-col"
    >
      <div class="group-title flex justify-between">
        <div class="cursor-move">
          {{ `${index + 1}. ${group.name}` }}
        </div>
        <ElDropdown @command="handleCommad($event, group)">
          <ElButton circle type="primary" size="small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 32 32"><path fill="currentColor" d="M27 16.76v-1.53l1.92-1.68A2 2 0 0 0 29.3 11l-2.36-4a2 2 0 0 0-1.73-1a2 2 0 0 0-.64.1l-2.43.82a11.35 11.35 0 0 0-1.31-.75l-.51-2.52a2 2 0 0 0-2-1.61h-4.68a2 2 0 0 0-2 1.61l-.51 2.52a11.48 11.48 0 0 0-1.32.75l-2.38-.86A2 2 0 0 0 6.79 6a2 2 0 0 0-1.73 1L2.7 11a2 2 0 0 0 .41 2.51L5 15.24v1.53l-1.89 1.68A2 2 0 0 0 2.7 21l2.36 4a2 2 0 0 0 1.73 1a2 2 0 0 0 .64-.1l2.43-.82a11.35 11.35 0 0 0 1.31.75l.51 2.52a2 2 0 0 0 2 1.61h4.72a2 2 0 0 0 2-1.61l.51-2.52a11.48 11.48 0 0 0 1.32-.75l2.42.82a2 2 0 0 0 .64.1a2 2 0 0 0 1.73-1l2.28-4a2 2 0 0 0-.41-2.51ZM25.21 24l-3.43-1.16a8.86 8.86 0 0 1-2.71 1.57L18.36 28h-4.72l-.71-3.55a9.36 9.36 0 0 1-2.7-1.57L6.79 24l-2.36-4l2.72-2.4a8.9 8.9 0 0 1 0-3.13L4.43 12l2.36-4l3.43 1.16a8.86 8.86 0 0 1 2.71-1.57L13.64 4h4.72l.71 3.55a9.36 9.36 0 0 1 2.7 1.57L25.21 8l2.36 4l-2.72 2.4a8.9 8.9 0 0 1 0 3.13L27.57 20Z" /><path fill="currentColor" d="M16 22a6 6 0 1 1 6-6a5.94 5.94 0 0 1-6 6Zm0-10a3.91 3.91 0 0 0-4 4a3.91 3.91 0 0 0 4 4a3.91 3.91 0 0 0 4-4a3.91 3.91 0 0 0-4-4Z" /></svg>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="编辑">
                编辑
              </ElDropdownItem>
              <ElDropdownItem v-if="allGroups.length > 1" command="删除">
                删除
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div ref="dragExtRef" class="group-ext-container  flex flex-1 flex-col gap-10px">
        <div v-for="ext in group.exts" :key="ext.id" class="group-ext-item flex cursor-move">
          <img :src="ext._icon" class="h-18px w-18px mr-10px">
          <div class="truncate">
            {{ ext.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- dialog -->
  <ElDialog
    v-model="visible"
    :title="title"
    width="450px"
    :close-on-click-modal="false"
    @closed="handleCancel"
  >
    <ElForm ref="formRef" :model="form" :rules="rules">
      <ElFormItem label="分组名称" prop="name">
        <ElInput v-model="form.name" autofocus placeholder="请输入" />
      </ElFormItem>
      <div class="flex items-center gap-30px">
        <ElFormItem label="默认展开" required class="!mb-0">
          <ElSwitch v-model="form.expand" />
        </ElFormItem>
        <ElFormItem label="是否隐藏" required class="!mb-0">
          <ElSwitch v-model="form.hide" />
        </ElFormItem>
      </div>
    </ElForm>
    <template #footer>
      <span>
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleOk">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ElButton, ElDialog, ElDropdown, ElDropdownItem, ElDropdownMenu, ElForm, ElFormItem, ElInput, ElMessage, ElSwitch } from 'element-plus'
import type { Management } from 'webextension-polyfill'
import { useDraggable } from 'vue-draggable-plus'
import { extGroups, setDefaultGroup } from '~/logic/storage'

interface ExtRefGroup extends ExtGroupWithoutExts {
  exts: Ref<Ext[]>
}

const title = ref('新增分组')
const visible = ref(false)
const formRef = ref()
const form = ref({
  id: 0,
  name: '',
  hide: false,
  expand: true,
})
const rules = ref({
  name: [{ required: true, message: '请输入分组名称', trigger: 'change' }],
})

const allGroups = ref<ExtRefGroup[]>([])

// 获取所有扩展
browser.management.getAll().then(async (res) => {
  // 循环获取ext信息
  res.forEach(async (item) => {
    item = await browser.management.get(item.id)
  })
  res.sort((a, b) => {
    return a.name.localeCompare(b.name, 'en', { sensitivity: 'accent' })
  })
  // 设置默认分组
  setDefaultGroup(res.map((item) => {
    return {
      ...item,
      _icon: getIcon(item.icons),
    }
  }))
  allGroups.value = JSON.parse(JSON.stringify(extGroups.value)).map((item: any) => {
    return {
      ...item,
      exts: ref(item.exts),
    }
  })
})

watch(allGroups, (val) => {
  extGroups.value = val
}, {
  flush: 'post',
  deep: true,
})

const dragRef = ref()
const dragExtRef = ref()
// 拖拽
watch(dragRef, () => {
  useDraggable(dragRef, allGroups, { animation: 150, handle: '.cursor-move' })
}, {
  flush: 'post',
})
watch(dragExtRef, (val) => {
  val.forEach((el: any, index: number) => {
    useDraggable(
      el,
      // @ts-expect-error exts
      allGroups.value[index].exts,
      {
        animation: 150,
        group: 'ext',
        handle: '.cursor-move',
      })
  })
}, {
  flush: 'post',
  deep: true,
})

function handleCommad(command: string, group: ExtGroup) {
  if (command === '编辑') {
    title.value = '编辑分组'
    form.value.id = group.id
    form.value.name = group.name
    form.value.hide = group.hide
    form.value.expand = group.expand
    visible.value = true
  }
  else {
    const delExtIds = group.exts
    if (delExtIds.length > 0) {
      if (group.id === 0) {
        ElMessage.warning('此组为默认分组，请先移动分组下的扩展后再删除分组！')
      }
      else {
        allGroups.value = allGroups.value.filter(item => item.id !== group.id)

        const defaultGroup = allGroups.value.find(item => item.id === 0)
        if (defaultGroup) {
          defaultGroup.exts.push(...delExtIds)
        }
        else {
          allGroups.value.push({
            id: 0,
            name: '默认分组',
            enabled: true,
            hide: false,
            expand: true,
            exts: delExtIds,
          })
        }
      }
    }
    else {
      allGroups.value = allGroups.value.filter(item => item.id !== group.id)
    }
  }
}

function handleOk() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (title.value === '新增分组') {
        allGroups.value.push({
          id: Date.now(),
          name: form.value.name,
          enabled: true,
          hide: form.value.hide,
          expand: form.value.expand,
          exts: [],
        })
      }
      else {
        allGroups.value = allGroups.value.map((item) => {
          if (item.id === form.value.id) {
            item.name = form.value.name
            item.hide = form.value.hide
            item.expand = form.value.expand
          }
          return item
        })
      }
      visible.value = false
    }
  })
}

function handleCancel() {
  title.value = '新增分组'
  form.value.id = 0
  form.value.name = ''
  formRef.value.resetFields()
}

// 获取分辨率最大的icon
function getIcon(icons?: Management.IconInfo[]) {
  if (!icons || icons.length === 0) return '/assets/ext-icon.png'

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
</script>

<style lang="scss">
.el-dialog,
.el-message-box {
  .el-button--primary {
    background-color: var(--el-button-bg-color) !important;
  }
  .el-button--primary:hover {
    background-color: var(--el-button-hover-bg-color) !important;
  }
}

.group-container {
  border-radius: 6px;
  padding: 10px;
  transition: all 0.3s;
  border: 1px solid var(--el-border-color);

  .el-button--primary {
    background-color: var(--el-button-bg-color) !important;
  }
  .el-button--primary:hover {
    background-color: var(--el-button-hover-bg-color) !important;
  }
  .group-item {
    border-radius: 6px;
    transition: all 0.3s;
    border: 1px solid var(--el-border-color-dark);
    .group-title {
      font-size:16px;
      padding: 10px 20px;
      border-bottom: 1px solid var(--el-border-color-dark);
    }
    .group-ext-container {
      padding: 10px;
      .group-ext-item {
        padding: 10px;
        border-radius: 6px;
        border: 1px solid var(--el-border-color);
      }
    }
  }
}
</style>
