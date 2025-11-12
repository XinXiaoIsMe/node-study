<script setup lang="ts">
import { Hide, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { isAxiosError } from 'axios'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  type Role,
  type UserProfile,
  useAuthStore,
} from '../stores/auth'
import http from '../services/http'

interface LoginForm {
  username: string
  password: string
}

interface LoginPayload {
  user?: Partial<UserProfile> & { id?: number }
  token?: string
  message?: string
}

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const loginForm = reactive<LoginForm>({
  username: auth.state.user?.username || '',
  password: '',
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const showPassword = ref(false)

const rules: FormRules<LoginForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const isLoggedIn = computed(() => Boolean(auth.state.user))
const isAdmin = auth.isAdmin
const displayName = computed(
  () => auth.state.user?.nickname || auth.state.user?.username || loginForm.username,
)

const resetMessages = () => {
  ElMessage.closeAll()
}

const normalizeRole = (role: Role | string | undefined): Role =>
  role === 'admin' ? 'admin' : 'user'

const handleSubmit = async () => {
  if (!formRef.value) {
    return
  }

  resetMessages()

  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) {
    return
  }

  loading.value = true
  try {
    const { data: payload } = await http.post<LoginPayload>('/login', {
      username: loginForm.username,
      password: loginForm.password,
    })

    if (!payload?.user) {
      ElMessage.error(payload?.message || '登录失败，请稍后重试')
      return
    }

    const userId =
      payload.user.id !== undefined ? Number(payload.user.id) : 0

    const normalizedGender =
      typeof payload.user.gender === 'number' && payload.user.gender > 0
        ? payload.user.gender
        : null

    const user: UserProfile = {
      id: Number.isNaN(userId) ? 0 : userId,
      username: String(payload.user.username),
      nickname:
        payload.user.nickname !== undefined
          ? (payload.user.nickname as string | null)
          : null,
      gender: normalizedGender,
      selfIntro:
        payload.user.selfIntro !== undefined
          ? (payload.user.selfIntro as string | null)
          : null,
      avatarUpdatedAt:
        payload.user.avatarUpdatedAt !== undefined
          ? (payload.user.avatarUpdatedAt as string | null)
          : null,
      role: normalizeRole(payload.user.role as Role | undefined),
    }

    const token = payload.token || ''
    auth.setAuth({ user, token })
    loginForm.password = ''
    ElMessage.success(`欢迎回来，${user.nickname || user.username}!`)
    loginForm.username = user.username

    const redirectTarget =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/calendar'
    await router.push(redirectTarget)
  } catch (error) {
    console.error('login request failed', error)
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        '登录失败，请稍后重试'
      ElMessage.error(message)
    } else {
      ElMessage.error('无法连接服务器，请检查网络或稍后再试')
    }
  } finally {
    loading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-layout">
    <el-card class="login-card" shadow="hover">
      <div class="login-card__header">
        <h1>Todo List 登录</h1>
        <p>使用账号密码登录管理你的待办事项</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            autocomplete="username"
            maxlength="50"
            placeholder="请输入用户名"
            :disabled="loading"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="请输入密码"
            maxlength="50"
            :disabled="loading"
          >
            <template #suffix>
              <el-icon
                class="password-toggle"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                role="button"
                tabindex="0"
                @click="togglePasswordVisibility"
                @keydown.enter.prevent="togglePasswordVisibility"
                @keydown.space.prevent="togglePasswordVisibility"
              >
                <component :is="showPassword ? Hide : View" />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            native-type="submit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="isLoggedIn" class="login-state">
        <el-divider />
        <div class="login-state__user">
          <span>当前登录：</span>
          <strong>{{ displayName }}</strong>
          <el-tag :type="isAdmin ? 'danger' : 'info'">
            {{ isAdmin ? '系统管理员' : '普通用户' }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 6vw, 64px);
  background: linear-gradient(135deg, #eff3ff, #f8fbff);
}

.login-card {
  width: min(420px, 100%);
}

.login-card__header {
  text-align: center;
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px;
    font-size: 26px;
    color: #1f2e55;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #5b6b83;
    font-size: 15px;
  }
}

.password-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3e7bfa;
  font-size: 18px;

  &:focus-visible {
    outline: 2px solid #3e7bfa;
    border-radius: 50%;
  }
}

.login-state {
  text-align: center;
}

.login-state__user {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #1f2e55;
  margin-bottom: 16px;
}

@media (max-width: 480px) {
  .login-layout {
    padding: 24px 16px;
  }

  .login-card__header {
    h1 {
      font-size: 22px;
    }
  }
}
</style>
