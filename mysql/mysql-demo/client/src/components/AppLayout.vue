<script setup lang="ts">
import {
  Calendar,
  CircleCheckFilled,
  EditPen,
  List,
  Plus,
  SwitchButton,
  User,
  UserFilled,
  Tools
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import http from '../services/http'

interface BaseMenuItem {
  label: string
  icon: Component
}

interface MenuLinkItem extends BaseMenuItem {
  path: string
}

interface MenuGroupItem extends BaseMenuItem {
  children: MenuLinkItem[]
}

type MenuItem = MenuLinkItem | MenuGroupItem

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const logoutLoading = ref(false)
const API_BASE = (http.defaults.baseURL ?? '').replace(/\/$/, '')

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
      icon: UserFilled,
      children: [
        { label: '新建用户', path: '/users', icon: Plus },
        { label: '我的账号', path: '/users/account', icon: User },
        { label: '管理账号', path: '/users/list', icon: Tools },
      ],
    })
  }

  return items
})

const activePath = computed(() => route.path)

const isChildActive = (item: MenuGroupItem) =>
  item.children.some((child) => child.path === activePath.value)

const handleSelect = async (path: string) => {
  if (path === route.path) {
    return
  }
  await router.push(path)
}

const displayName = computed(
  () => auth.state.user?.nickname || auth.state.user?.username || '游客',
)

const avatarUrl = computed(() => {
  const token = auth.state.token
  if (!token) {
    return null
  }
  const params = new URLSearchParams({
    ts: new Date().toISOString(),
    token,
  })
  return `${API_BASE}/users/me/avatar?${params.toString()}`
})

const displayInitial = computed(() => {
  const name = displayName.value || ''
  return name.charAt(0) || '访'
})

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
        active-text-color="#ffd04b"
        @select="handleSelect"
      >
      <template v-for="item in menuItems" :key="item.label">
        <el-sub-menu
          v-if="'children' in item"
          :index="item.label"
          :class="{ 'is-submenu-active': isChildActive(item) }"
          popper-class="app-layout__submenu-popper"
        >
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            <el-icon><component :is="child.icon" /></el-icon>
            <span>{{ child.label }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
          v-else
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </template>
      </el-menu>
      <div class="app-layout__actions">
        <div class="app-layout__user">
          <el-avatar
            class="app-layout__avatar"
            :size="36"
            :src="avatarUrl || undefined"
          >
            {{ displayInitial }}
          </el-avatar>
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
:global(:root) {
  --app-brand-gradient: linear-gradient(135deg, #4f6cff, #6b8bff);
  --app-brand-shadow: 0 8px 20px rgba(79, 108, 255, 0.35);
  --app-menu-text-color: #ffffff;
  --app-menu-active-color: #ffd04b;
  --app-submenu-text-color: #303133;
  --app-submenu-active-color: #4f6cff;
  --app-layout-bg: radial-gradient(circle at top, #f7faff 0%, #eef3ff 100%);
}

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--app-layout-bg);
}

.app-layout__header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 32px;
  background: var(--app-brand-gradient);
  color: var(--app-menu-text-color);
  box-shadow: var(--app-brand-shadow);
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

  :deep(> .el-menu-item),
  :deep(> .el-sub-menu > .el-sub-menu__title) {
    color: var(--app-menu-text-color);
  }

  :deep(> .el-menu-item .el-icon),
  :deep(> .el-sub-menu > .el-sub-menu__title .el-icon) {
    color: var(--app-menu-text-color);
  }

  :deep(> .el-menu-item.is-active),
  :deep(> .el-menu-item.is-active .el-icon) {
    color: var(--app-menu-active-color);
  }

  :deep(> .el-sub-menu.is-submenu-active > .el-sub-menu__title .el-icon) {
    color: var(--app-menu-active-color);
  }

  :deep(.is-submenu-active > .el-sub-menu__title) {
    color: var(--app-menu-active-color) !important;
    font-weight: 600;
  }

  :deep(.is-submenu-active > .el-sub-menu__title .el-icon) {
    color: var(--app-menu-active-color) !important;
  }
}

:global(.app-layout__submenu-popper .el-menu-item) {
  color: var(--app-submenu-text-color) !important;
}

:global(.app-layout__submenu-popper .el-sub-menu__title) {
  color: var(--app-submenu-text-color) !important;
}

:global(.app-layout__submenu-popper .el-icon) {
  color: var(--app-submenu-text-color) !important;
}

:global(.app-layout__submenu-popper .el-menu-item.is-active),
:global(.app-layout__submenu-popper .el-menu-item:hover),
:global(.app-layout__submenu-popper .el-sub-menu__title.is-active),
:global(.app-layout__submenu-popper .el-sub-menu__title:hover) {
  color: var(--app-submenu-active-color) !important;
}

:global(.app-layout__submenu-popper .el-menu-item.is-active .el-icon),
:global(.app-layout__submenu-popper .el-menu-item:hover .el-icon),
:global(.app-layout__submenu-popper .el-sub-menu__title.is-active .el-icon),
:global(.app-layout__submenu-popper .el-sub-menu__title:hover .el-icon) {
  color: var(--app-submenu-active-color) !important;
}

:global(.app-layout__submenu-popper .el-menu) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  --el-menu-border-color: transparent;
}

:global(.app-layout__submenu-popper .el-menu--popup) {
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.app-layout__avatar {
  background: rgba(255, 255, 255, 0.18);
  color: var(--app-menu-text-color);
  font-weight: 600;
}

.app-layout__actions {
  display: flex;
  align-items: center;
  gap: 16px;
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
  color: var(--app-menu-text-color);
  font-size: 18px;

  &:hover {
    color: var(--app-menu-active-color);
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
