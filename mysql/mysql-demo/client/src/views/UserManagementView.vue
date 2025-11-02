<script setup lang="ts">
import { Hide, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { isAxiosError } from 'axios'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { type Role, useAuthStore } from '../stores/auth'
import http from '../services/http'
import AppLayout from '../components/AppLayout.vue'

interface CreateUserForm {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  role: Role
}

interface CreateUserResponse {
  user?: {
    username?: string
  }
  message?: string
}

const auth = useAuthStore()
const router = useRouter()

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: 'user', label: '普通用户' },
  { value: 'admin', label: '系统管理员' },
]

const createForm = reactive<CreateUserForm>({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  role: 'user',
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const validateConfirmPassword: NonNullable<FormItemRule['validator']> = (
  _rule,
  value: string,
  callback,
) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (value !== createForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules: FormRules<CreateUserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少 3 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码以确认', trigger: 'blur' },
    {
      validator: validateConfirmPassword,
      trigger: ['blur', 'change'] as const,
    },
  ],
  nickname: [
    { max: 30, message: '昵称长度请控制在 30 个字符以内', trigger: 'blur' },
  ],
}

const currentUserName = computed(
  () => auth.state.user?.nickname || auth.state.user?.username || '',
)

const resetFeedback = () => {
  ElMessage.closeAll()
}

const resetForm = () => {
  formRef.value?.resetFields()
  createForm.username = ''
  createForm.password = ''
  createForm.confirmPassword = ''
  createForm.nickname = ''
  createForm.role = 'user'
}

const redirectToLogin = () => {
  router.push({ name: 'login', query: { redirect: '/users' } })
}

const ensureToken = () => {
  if (!auth.state.token) {
    ElMessage.error('登录状态已过期，请重新登录')
    redirectToLogin()
    return false
  }
  return true
}

const handleCreateUser = async () => {
  if (!formRef.value) {
    return
  }

  resetFeedback()

  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) {
    return
  }

  if (!ensureToken()) {
    return
  }

  loading.value = true
  try {
    const { data } = await http.post<CreateUserResponse>('/users', {
      username: createForm.username,
      password: createForm.password,
      nickname: createForm.nickname || null,
      role: createForm.role,
    })

    ElMessage.success(
      `用户 ${data?.user?.username || createForm.username} 创建成功`,
    )
    resetForm()
  } catch (error) {
    console.error('create user request failed', error)
    if (isAxiosError(error)) {
      const status = error.response?.status
      if (status === 403) {
        return
      }
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        (status === 401 ? '登录状态已过期，请重新登录' : '创建用户失败，请稍后重试')
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

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

watch(
  () => createForm.password,
  () => {
    if (createForm.confirmPassword) {
      formRef.value?.validateField('confirmPassword').catch(() => {})
    }
  },
)
</script>

<template>
  <AppLayout>
    <div class="users-layout">
      <el-card class="users-card" shadow="hover">
        <template #header>
          <div class="users-card__header">
            <div>
              <h2>用户管理</h2>
              <p>仅系统管理员可创建并维护系统用户</p>
            </div>
            <el-tag type="danger">系统管理员</el-tag>
          </div>
        </template>

        <el-descriptions
          v-if="currentUserName"
          class="users-descriptions"
          :column="1"
          border
          size="small"
        >
          <el-descriptions-item label="当前管理员">
            {{ currentUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="登录账号">
            {{ auth.state.user?.username }}
          </el-descriptions-item>
        </el-descriptions>

        <el-form
          ref="formRef"
          :model="createForm"
          :rules="rules"
          label-position="top"
          size="large"
          @submit.prevent="handleCreateUser"
        >
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="createForm.username"
                  autocomplete="off"
                  placeholder="请输入新用户用户名"
                  maxlength="50"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="createForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="请输入初始密码"
                  maxlength="50"
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
            </el-col>
            <el-col :span="24">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="createForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="请再次输入密码"
                  maxlength="50"
                >
                  <template #suffix>
                    <el-icon
                      class="password-toggle"
                      :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                      role="button"
                      tabindex="0"
                      @click="toggleConfirmPasswordVisibility"
                      @keydown.enter.prevent="toggleConfirmPasswordVisibility"
                      @keydown.space.prevent="toggleConfirmPasswordVisibility"
                    >
                      <component :is="showConfirmPassword ? Hide : View" />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="昵称（可选）" prop="nickname">
                <el-input
                  v-model="createForm.nickname"
                  autocomplete="off"
                  placeholder="填写用户昵称"
                  maxlength="30"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="角色" prop="role">
                <el-select v-model="createForm.role" placeholder="请选择角色">
                  <el-option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              native-type="submit"
            >
              创建用户
            </el-button>
            <el-button
              :disabled="loading"
              @click="resetForm"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.users-layout {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 6vw, 64px) 0;
}

.users-card {
  width: min(720px, 100%);
}

.users-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

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

.users-descriptions {
  margin-bottom: 24px;
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

@media (max-width: 640px) {
  .users-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .users-layout {
    padding: 24px 0;
  }
}
</style>
