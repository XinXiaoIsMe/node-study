<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { isAxiosError } from 'axios'
import { onMounted, reactive, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import http from '../services/http'

interface Task {
  id: number
  title: string
  description: string
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  createTime: string
  updateTime: string
}

const tasks = ref<Task[]>([])
const loading = ref(false)
const statusChanging = ref<number[]>([])
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: 0,
  title: '',
  description: '',
  dueDate: null as string | null,
  priority: 'medium' as Task['priority'],
})

const rules: FormRules<typeof editForm> = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
}

const priorityLabel: Record<Task['priority'], string> = {
  low: '低',
  medium: '普通',
  high: '高',
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const { data } = await http.get<{ tasks: Task[] }>('/tasks')
    tasks.value = data.tasks
  } catch (error) {
    console.error('fetch tasks failed', error)
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        '获取任务失败，请稍后重试'
      ElMessage.error(message)
    } else {
      ElMessage.error('无法连接服务器，请稍后再试')
    }
  } finally {
    loading.value = false
  }
}

const handleStatusToggle = async (task: Task) => {
  const nextStatus: Task['status'] = task.status === 'completed' ? 'pending' : 'completed'
  if (!statusChanging.value.includes(task.id)) {
    statusChanging.value.push(task.id)
  }
  try {
    await http.patch(`/tasks/${task.id}/status`, { status: nextStatus })
    task.status = nextStatus
    ElMessage.success('任务状态已更新')
  } catch (error) {
    console.error('update task status failed', error)
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        '更新状态失败，请稍后重试'
      ElMessage.error(message)
    } else {
      ElMessage.error('无法连接服务器，请稍后再试')
    }
  } finally {
    statusChanging.value = statusChanging.value.filter((id) => id !== task.id)
  }
}

const openEditDialog = (task: Task) => {
  editForm.id = task.id
  editForm.title = task.title
  editForm.description = task.description
  editForm.dueDate = task.dueDate
  editForm.priority = task.priority
  editDialogVisible.value = true
}

const resetEditForm = () => {
  editFormRef.value?.resetFields()
  editForm.id = 0
  editForm.title = ''
  editForm.description = ''
  editForm.dueDate = null
  editForm.priority = 'medium'
}

const submitEdit = async () => {
  if (!editFormRef.value) {
    return
  }

  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    const { data } = await http.put<{ task: Task | null }>(`/tasks/${editForm.id}`, {
      title: editForm.title,
      description: editForm.description,
      dueDate: editForm.dueDate,
      priority: editForm.priority,
    })

    if (data.task) {
      const index = tasks.value.findIndex((t) => t.id === editForm.id)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...data.task }
      }
    } else {
      await fetchTasks()
    }

    ElMessage.success('任务已更新')
    editDialogVisible.value = false
    resetEditForm()
  } catch (error) {
    console.error('update task failed', error)
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        '更新任务失败，请稍后重试'
      ElMessage.error(message)
    } else {
      ElMessage.error('无法连接服务器，请稍后再试')
    }
  }
}

const formatDate = (value: string | null) => {
  if (!value) {
    return '未设置'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

const isStatusLoading = (taskId: number) => statusChanging.value.includes(taskId)

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <AppLayout>
    <div class="todo-list">
      <el-card class="todo-card" shadow="hover">
        <template #header>
          <div class="todo-card__header">
            <h2>我的待办</h2>
            <p>查看并管理当前账户的任务列表，支持更新状态与编辑详情</p>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="tasks"
          stripe
          @row-dblclick="openEditDialog"
        >
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="dueDate" label="截止时间" min-width="180">
            <template #default="scope">
              {{ formatDate(scope.row.dueDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="120">
            <template #default="{ row }">
              <el-tag :type="row.priority === 'high' ? 'danger' : row.priority === 'medium' ? 'warning' : 'info'">
                {{ priorityLabel[row.priority as keyof typeof priorityLabel] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="180">
            <template #default="scope">
              <el-switch
                :loading="isStatusLoading(scope.row.id)"
                :model-value="scope.row.status === 'completed'"
                active-text="已完成"
                inactive-text="待处理"
                @change="handleStatusToggle(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" min-width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updateTime) }}
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && tasks.length === 0" description="当前没有待办任务" />
      </el-card>

      <el-dialog
        v-model="editDialogVisible"
        title="编辑任务"
        width="520px"
        @close="resetEditForm"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="rules" label-width="90px">
          <el-form-item label="任务标题" prop="title">
            <el-input v-model="editForm.title" maxlength="120" show-word-limit />
          </el-form-item>
          <el-form-item label="任务描述" prop="description">
            <el-input
              v-model="editForm.description"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </el-form-item>
          <el-form-item label="截止时间" prop="dueDate">
            <el-date-picker
              v-model="editForm.dueDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择截止时间（可选）"
              clearable
            />
          </el-form-item>
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="editForm.priority">
              <el-option label="低" value="low" />
              <el-option label="普通" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.todo-list {
  display: flex;
  justify-content: center;
  padding: clamp(24px, 5vw, 48px) 0;
}

.todo-card {
  width: min(960px, 100%);
}

.todo-card__header {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
