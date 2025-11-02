import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { useAuthStore } from '../stores/auth'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
})

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const headers = config.headers ?? {}

  const url = config.url ?? ''
  const isAuthRoute = typeof url === 'string' && url.replace(/\?.*$/, '') === '/login'

  if (auth.state.token && !isAuthRoute) {
    headers.Authorization = `Bearer ${auth.state.token}`
  }

  if (
    config.method &&
    config.method.toUpperCase() !== 'GET' &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json'
  }

  config.headers = headers
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      const auth = useAuthStore()
      auth.clearAuth()

      if (status === 401) {
        ElMessage.error('登录状态已过期，请重新登录')
      }

      if (status === 403) {
        ElMessage.error('当前账号无权限执行该操作')
      }

      const currentRoute = router.currentRoute.value
      if (currentRoute.name !== 'login') {
        await router.push({
          name: 'login',
          query: { redirect: currentRoute.fullPath },
        })
      }
    }

    return Promise.reject(error)
  },
)

export default http
