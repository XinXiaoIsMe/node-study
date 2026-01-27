<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

// Todo 类型（与后端返回保持一致）
type Todo = {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

const API_BASE_URL = 'http://localhost:3000'

const todos = ref<Todo[]>([])
const listLoading = ref(false)

const createTitle = ref('')
const createLoading = ref(false)

const editVisible = ref(false)
const editId = ref<number | null>(null)
const editTitle = ref('')
const editLoading = ref(false)

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as { message?: unknown }
      const message = Array.isArray(data.message)
        ? data.message.join('；')
        : typeof data.message === 'string'
          ? data.message
          : ''
      throw new Error(message || `请求失败：${response.status}`)
    }

    const text = await response.text()
    throw new Error(text || `请求失败：${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return undefined as unknown as T
  }

  return (await response.json()) as T
}

async function fetchTodos() {
  try {
    listLoading.value = true
    todos.value = await apiRequest<Todo[]>('/todos')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载失败')
  } finally {
    listLoading.value = false
  }
}

async function createTodo() {
  const title = createTitle.value.trim()
  if (!title) {
    ElMessage.warning('请输入待办内容')
    return
  }

  try {
    createLoading.value = true
    await apiRequest<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    createTitle.value = ''
    ElMessage.success('已添加')
    await fetchTodos()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '添加失败')
  } finally {
    createLoading.value = false
  }
}

function openEdit(todo: Todo) {
  editId.value = todo.id
  editTitle.value = todo.title
  editVisible.value = true
}

async function submitEdit() {
  const id = editId.value
  const title = editTitle.value.trim()
  if (!id) return

  if (!title) {
    ElMessage.warning('标题不能为空')
    return
  }

  try {
    editLoading.value = true
    await apiRequest<Todo>(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })
    editVisible.value = false
    ElMessage.success('已更新')
    await fetchTodos()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  } finally {
    editLoading.value = false
  }
}

async function toggleCompleted(todo: Todo, value: boolean) {
  const previous = todo.completed
  todo.completed = value

  try {
    await apiRequest<Todo>(`/todos/${todo.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: value }),
    })
  } catch (error) {
    todo.completed = previous
    ElMessage.error(error instanceof Error ? error.message : '更新状态失败')
  }
}

async function removeTodo(todo: Todo) {
  try {
    await ElMessageBox.confirm(`确认删除「${todo.title}」？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    await apiRequest<{ ok: true }>(`/todos/${todo.id}`, {
      method: 'DELETE',
    })
    ElMessage.success('已删除')
    await fetchTodos()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function getTodoRowClassName({ row }: { row: Todo }): string {
  return row.completed ? 'row-completed' : 'row-pending'
}

onMounted(fetchTodos)
</script>

<template>
  <div class="page">
    <el-card class="card">
      <template #header>
        <div class="header">
          <span class="title">TodoList</span>
          <div class="actions">
            <el-button :loading="listLoading" @click="fetchTodos">刷新</el-button>
          </div>
        </div>
      </template>

      <div class="create">
        <el-input
          v-model="createTitle"
          placeholder="输入待办事项，回车添加"
          clearable
          @keyup.enter="createTodo"
        />
        <el-button type="primary" :loading="createLoading" @click="createTodo">添加</el-button>
      </div>

      <el-table
        :data="todos"
        stripe
        class="table"
        v-loading="listLoading"
        :row-class-name="getTodoRowClassName"
      >
        <el-table-column label="完成" width="80">
          <template #default="{ row }">
            <el-checkbox
              :model-value="row.completed"
              @change="(v: boolean) => toggleCompleted(row, v)"
            />
          </template>
        </el-table-column>

        <el-table-column label="内容" min-width="240">
          <template #default="{ row }">
            <span class="todo-title" :class="{ 'is-completed': row.completed }">
              {{ row.title }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="200">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeTodo(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer">
        <span>总数：{{ todos.length }}</span>
        <span>已完成：{{ todos.filter((t) => t.completed).length }}</span>
      </div>
    </el-card>

    <el-dialog v-model="editVisible" title="编辑 Todo" width="520" :close-on-click-modal="false">
      <el-input v-model="editTitle" placeholder="请输入内容" @keyup.enter="submitEdit" />
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.card {
  width: min(980px, calc(100vw - 32px));
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.create {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.table {
  width: 100%;
}

.todo-title {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.todo-title.is-completed {
  font-weight: 400;
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}

:deep(.el-table__row.row-completed) {
  color: var(--el-text-color-secondary);
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 12px;
  color: var(--el-text-color-secondary);
}
</style>
