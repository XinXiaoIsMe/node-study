import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { isAxiosError } from 'axios'
import http from '../services/http'

export type Task = {
  id: number
  title: string
  description: string
  startDate: string | null
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  createTime: string
  updateTime: string
}

export function useTaskList(statusFilter: Task['status']) {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const statusChanging = ref<number[]>([])
  const editDialogVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const editForm = reactive({
    id: 0,
    title: '',
    description: '',
    startDate: null as string | null,
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
      const { data } = await http.get<{ tasks: Task[] }>('/tasks', {
        params: { status: statusFilter },
      })
      tasks.value = data.tasks
    } catch (error) {
      console.error('fetch tasks failed', error)
      if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: string } | undefined)?.message || '获取任务失败，请稍后重试'
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
      fetchTasks()
      ElMessage.success('任务状态已更新')
    } catch (error) {
      console.error('update task status failed', error)
      if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: string } | undefined)?.message || '更新状态失败，请稍后重试'
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
    editForm.startDate = task.startDate
    editForm.dueDate = task.dueDate
    editForm.priority = task.priority
    editDialogVisible.value = true
  }

  const resetEditForm = () => {
    editFormRef.value?.resetFields()
    editForm.id = 0
    editForm.title = ''
    editForm.description = ''
    editForm.startDate = null
    editForm.dueDate = null
    editForm.priority = 'medium'
  }

  const submitEdit = async () => {
    if (!editFormRef.value) return
    const valid = await editFormRef.value.validate().catch(() => false)
    if (!valid) return

    try {
      const { data } = await http.put<{ task: Task | null }>(`/tasks/${editForm.id}`, {
        title: editForm.title,
        description: editForm.description,
        startDate: editForm.startDate,
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
        const message = (error.response?.data as { message?: string } | undefined)?.message || '更新任务失败，请稍后重试'
        ElMessage.error(message)
      } else {
        ElMessage.error('无法连接服务器，请稍后再试')
      }
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return '未设置'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  const isStatusLoading = (taskId: number) => statusChanging.value.includes(taskId)

  onMounted(() => {
    fetchTasks()
  })

  return {
    tasks,
    loading,
    statusChanging,
    editDialogVisible,
    editFormRef,
    editForm,
    rules,
    priorityLabel,
    fetchTasks,
    handleStatusToggle,
    openEditDialog,
    resetEditForm,
    submitEdit,
    formatDate,
    isStatusLoading,
  }
}

