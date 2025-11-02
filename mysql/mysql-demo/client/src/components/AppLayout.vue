<script setup lang="ts">
import {
  Calendar,
  CircleCheckFilled,
  EditPen,
  List,
  SwitchButton,
  UserFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import http from '../services/http'

interface MenuItem {
  label: string
  path: string
  icon: Component
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const logoutLoading = ref(false)

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { label: '我的待办', path: '/todos', icon: List },
    { label: '我的已办', path: '/done', icon: CircleCheckFilled },
    { label: '任务日历', path: '/calendar', icon: Calendar },
    { label: '新建任务', path: '/tasks/new', icon: EditPen },
  ]

  if (auth.isAdmin.value) {
    items.push({
      label: '用户管理',
      path: '/users',
      icon: UserFilled,
    })
  }

  return items
})

const activePath = computed(() => route.path)

const handleSelect = async (path: string) => {
  if (path === route.path) {
    return
  }
  await router.push(path)
}

const displayName = computed(
  () => auth.state.user?.nickname || auth.state.user?.username || '游客',
)

const handleLogout = async () => {
  if (!auth.state.token) {
    auth.clearAuth()
    ElMessage.success('已退出登录')
    await router.push({ name: 'login' })
    return
  }

  logoutLoading.value = true
  try {
    await http.post('/logout')
  } catch (error) {
    console.error('logout request failed', error)
  } finally {
    logoutLoading.value = false
    auth.clearAuth()
    ElMessage.success('已退出登录')
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <el-container class="app-layout">
    <el-header class="app-layout__header">
      <div class="app-layout__brand">Todo 管理系统</div>
      <el-menu
        class="app-layout__menu"
        mode="horizontal"
        :default-active="activePath"
        background-color="transparent"
        text-color="#ffffff"
        active-text-color="#ffd04b"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <div class="app-layout__actions">
        <div class="app-layout__user">
          <span class="app-layout__user-label">当前用户</span>
          <strong>{{ displayName }}</strong>
          <el-tag
            v-if="auth.state.user"
            :type="auth.isAdmin.value ? 'danger' : 'info'"
            round
          >
            {{ auth.isAdmin.value ? '管理员' : '普通用户' }}
          </el-tag>
        </div>
        <el-tooltip
          v-if="auth.state.user"
          content="退出登录"
          placement="bottom"
        >
          <el-button
            class="app-layout__logout"
            :loading="logoutLoading"
            circle
            text
            aria-label="退出登录"
            @click="handleLogout"
          >
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </el-header>
    <el-main class="app-layout__main">
      <slot />
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(circle at top, #f7faff 0%, #eef3ff 100%);
}

.app-layout__header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 32px;
  background: linear-gradient(135deg, #4f6cff, #6b8bff);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(79, 108, 255, 0.35);
  flex-shrink: 0;
}

.app-layout__brand {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.app-layout__menu {
  flex: 1;
  background: transparent;
  border-bottom: none;

  :deep(.el-menu-item) {
    font-size: 15px;
    gap: 6px;
  }
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.app-layout__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-layout__user-label {
  opacity: 0.85;
}

.app-layout__main {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: clamp(24px, 5vw, 48px);
  background: transparent;
  overflow-y: auto;
}

.app-layout__logout {
  color: #ffffff;
  font-size: 18px;

  &:hover {
    color: #ffd04b;
  }
}

@media (max-width: 768px) {
  .app-layout__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 24px;
  }

  .app-layout__menu {
    width: 100%;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
  }

  .app-layout__user {
    width: 100%;
    justify-content: space-between;
  }

  .app-layout__actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
