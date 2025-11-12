<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue'
import { useTaskList } from '../composables/useTaskList'

const {
  tasks,
  loading,
  editDialogVisible,
  editFormRef,
  editForm,
  rules,
  priorityLabel,
  handleStatusToggle,
  openEditDialog,
  resetEditForm,
  submitEdit,
  formatDate,
  isStatusLoading,
} = useTaskList('completed')
</script>

<template>
  <AppLayout>
    <div class="todo-list">
      <el-card class="todo-card" shadow="hover">
        <template #header>
          <div class="todo-card__header">
            <h2>我的已办</h2>
            <p>查看并管理当前账户的任务列表，支持更新状态与双击编辑详情</p>
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
          <el-table-column prop="startDate" label="开始时间" min-width="180">
            <template #default="scope">
              {{ formatDate(scope.row.startDate) }}
            </template>
          </el-table-column>
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
          <el-form-item label="开始时间" prop="startDate">
            <el-date-picker
              v-model="editForm.startDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间（可选）"
              clearable
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
