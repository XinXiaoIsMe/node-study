<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { isAxiosError } from 'axios'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import http from '../services/http'

interface TaskForm {
  title: string
  description: string
  startDate: string | null
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
}

const router = useRouter()

const formRef = ref<FormInstance>()
const submitting = ref(false)
import { formatDateTime } from '../utils/datetime'
const form = reactive<TaskForm>({
  title: '',
  description: '',
  startDate: formatDateTime(new Date()),
  dueDate: null,
  priority: 'medium',
})

const rules: FormRules<TaskForm> = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.title = ''
  form.description = ''
  form.startDate = formatDateTime(new Date())
  form.dueDate = null
  form.priority = 'medium'
}

const handleSubmit = async () => {
  if (!formRef.value) {
    return
  }

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }

  submitting.value = true
  try {
    await http.post('/tasks', {
      title: form.title,
      description: form.description || '',
      startDate: form.startDate,
      dueDate: form.dueDate,
      priority: form.priority,
    })
    ElMessage.success('任务创建成功')
    resetForm()
    await router.push('/todos')
  } catch (error) {
    console.error('create task request failed', error)
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        '任务创建失败，请稍后再试'
      ElMessage.error(message)
    } else {
      ElMessage.error('无法连接服务器，请稍后再试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="task-create">
      <el-card class="task-card" shadow="hover">
        <template #header>
          <div class="task-card__header">
            <h2>新建任务</h2>
            <p>填写任务信息，创建一条新的待办事项</p>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="96px"
          label-position="left"
          size="large"
          @submit.prevent
        >
          <el-form-item label="任务标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="输入任务名称"
              maxlength="120"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="开始时间" prop="startDate">
            <el-date-picker
              v-model="form.startDate"
              type="datetime"
              placeholder="选择开始时间（默认当前时间）"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>

          <el-form-item label="截止时间" prop="dueDate">
            <el-date-picker
              v-model="form.dueDate"
              type="datetime"
              placeholder="选择截止时间（可选）"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>

          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="选择优先级">
              <el-option label="低" value="low" />
              <el-option label="普通" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>

          <el-form-item label="任务描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              placeholder="补充任务详细信息（选填）"
            />
          </el-form-item>

          <el-form-item>
            <el-space>
              <el-button
                type="primary"
                :loading="submitting"
                @click="handleSubmit"
              >
                创建任务
              </el-button>
              <el-button :disabled="submitting" @click="resetForm">
                重置
              </el-button>
            </el-space>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.task-create {
  display: flex;
  justify-content: center;
  padding: clamp(24px, 5vw, 48px) 0;
}

.task-card {
  width: min(760px, 100%);
}

.task-card__header {
  h2 {
    margin: 0;
    font-size: 24px;
    color: #1f2e55;
    font-weight: 600;
  }

  p {
    margin: 6px 0 0;
    color: #5b6b83;
    font-size: 14px;
  }
}
</style>
