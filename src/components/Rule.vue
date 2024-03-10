<template>
  <div>
    <!-- title -->
    <div class="mt-12 mb-4 px-6px flex items-center justify-between text-16px">
      <ElButton class="opacity-0" type="primary" link size="default">
        新增规则
      </ElButton>
      <div class="dark:text-light">
        规则匹配
      </div>
      <ElButton class="relative top-10px" type="primary" link size="default" @click="handleAdd">
        新增规则
      </ElButton>
    </div>
    <!-- table -->
    <ElTable border :data="extRules" max-height="400px">
      <ElTableColumn type="index" label="序号" width="55" align="center" />
      <ElTableColumn prop="match" label="规则" width="220" align="center">
        <template #default="{ row }">
          <div v-html="row.match.replaceAll(',', '<br />')" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="extIds" label="扩展" width="220" align="center">
        <template #default="{ row }">
          <div
            v-for="ext in getExt(row)"
            :key="ext.name"
            :title="ext.name"
            class="flex items-center justify-center w-full"
          >
            <img :src="ext.icon" class="h-18px w-18px mr-10px">
            <div class="truncate text-left">
              {{ ext.name }}
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="140" align="center">
        <template #default="{ row }">
          <ElButton type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </ElButton>
          <ElButton type="primary" link size="small" @click="handleDelete(row)">
            删除
          </ElButton>
        </template>
      </ElTableColumn>
      <template #empty>
        暂无规则
      </template>
    </ElTable>
  </div>
  <!-- dialog -->
  <ElDialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @opened="handleChange"
    @closed="handleCancel"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="60px" :inline="false">
      <ElFormItem label="扩展" prop="extIds">
        <ElSelect
          v-model="form.extIds"
          placeholder="请选择扩展"
          clearable
          multiple
          @change="handleChange"
        >
          <ElOption v-for="ext in extList" :key="ext.id" :label="ext.name" :value="ext.id">
            <div class="flex items-center">
              <img :src="getIcon(ext.icons)" class="h-18px w-18px mr-10px">
              <div>{{ ext.name }}</div>
            </div>
          </ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="规则" prop="match">
        <ElInput
          v-model="form.match"
          type="textarea"
          placeholder="请输入匹配地址,多个以英文逗号隔开,例如：https://www.baidu.com,https://github.com"
        />
      </ElFormItem>
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
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus'
import type { Management } from 'webextension-polyfill'
import { extRules } from '~/logic/storage'

interface Form {
  id: number
  match: string
  extIds: string[]
}

const title = ref('新增规则')
const visible = ref(false)
const formRef = ref()
const form = ref<Form>({
  id: 0,
  match: '',
  extIds: [],
})
const rules = ref({
  match: [{ required: true, message: '请输入规则', trigger: 'change' }],
  extIds: [{ required: true, message: '请选择扩展', trigger: 'change' }],
})

// 获取所有扩展
const extList = ref<Management.ExtensionInfo[]>([])
browser.management.getAll().then(async (res) => {
  // 循环获取ext信息
  res.forEach(async (item) => {
    item = await browser.management.get(item.id)
  })
  extList.value = res.sort((a, b) => {
    return a.name.localeCompare(b.name, 'en', { sensitivity: 'accent' })
  })
})

function handleAdd() {
  visible.value = true
  title.value = '新增规则'
}

function handleOk() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const extRule = JSON.parse(JSON.stringify(form.value))
      if (title.value === '新增规则') {
        extRules.value.push({
          ...extRule,
          id: Date.now(),
        })
      }
      else {
        const index = extRules.value.findIndex(item => item.id === extRule.id)
        extRules.value.splice(index, 1, extRule)
      }
      visible.value = false
    }
  })
}

function handleCancel() {
  form.value = {
    id: 0,
    match: '',
    extIds: [],
  }
  formRef.value.resetFields()
}

function handleEdit(row: Form) {
  visible.value = true
  title.value = '编辑规则'
  // 如果row.extIds中有被删除的扩展,则删除
  const extIds = row.extIds.filter(item => extList.value.some(ext => ext.id === item))
  form.value = {
    ...row,
    extIds,
  }
}

function handleDelete(row: any) {
  ElMessageBox.confirm('确定要删除该规则吗?', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    extRules.value = extRules.value.filter(item => item.id !== row.id)
  })
}

function getExt(row: Form) {
  const exts = extList.value.filter(item => row.extIds.includes(item.id))
  return exts.map((item) => {
    return {
      name: item.name,
      icon: getIcon(item.icons),
    }
  })
}

// 扩展变更时匹配扩展图标
function handleChange() {
  nextTick(() => {
    const tags = document.querySelectorAll('.el-tag__content')
    tags.forEach((item: any) => {
      if (item.getAttribute('data-hasIcon') === null) {
        item.setAttribute('data-hasIcon', '')
        const extName = item.firstElementChild.innerText
        const ext = extList.value.find(item => item.name === extName)
        if (ext) {
          item.style.display = 'flex'
          item.style.maxWidth = '120px'
          item.innerHTML = `
            <img src="${getIcon(ext.icons)}" class="h-14px w-14px relative -left-4px">
            <div class="truncate">${extName}</div>
          `
        }
      }
    })
  })
}

// 获取分辨率最大的icon
function getIcon(icons?: Management.IconInfo[]) {
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
</script>

<style>
.el-dialog,
.el-message-box {
  .el-button--primary {
    background-color: var(--el-button-bg-color) !important;
  }
  .el-button--primary:hover {
    background-color: var(--el-button-hover-bg-color) !important;
  }
}
.el-select-tags-wrapper{
  text-align: left !important;
}
</style>
