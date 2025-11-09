import { computed, reactive, readonly } from 'vue'

export type Role = 'user' | 'admin'

export interface UserProfile {
  id: number
  username: string
  nickname: string | null
  gender: number | null
  selfIntro: string | null
  avatarUpdatedAt: string | null
  role: Role
}

interface AuthState {
  user: UserProfile | null
  token: string
}

const STORAGE_KEY = 'todo-auth-state'
const state = reactive<AuthState>({
  user: null,
  token: '',
})

let initialized = false

const loadFromStorage = () => {
  if (initialized || typeof window === 'undefined') {
    return
  }
  initialized = true

  const cached = window.sessionStorage.getItem(STORAGE_KEY)
  if (!cached) {
    return
  }

  try {
    const parsed = JSON.parse(cached) as Partial<AuthState>
    if (parsed.user && parsed.token) {
      state.user = parsed.user as UserProfile
      state.token = String(parsed.token)
    }
  } catch (error) {
    console.warn('failed to restore auth state from sessionStorage', error)
  }
}

const persistToStorage = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (!state.user || !state.token) {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      token: state.token,
    }),
  )
}

const setAuth = (payload: { user: UserProfile; token: string }) => {
  loadFromStorage()
  state.user = payload.user
  state.token = payload.token
  persistToStorage()
}

const updateUser = (partial: Partial<UserProfile>) => {
  loadFromStorage()
  if (!state.user) {
    return
  }
  state.user = {
    ...state.user,
    ...partial,
  }
  persistToStorage()
}

const clearAuth = () => {
  loadFromStorage()
  state.user = null
  state.token = ''
  persistToStorage()
}

const isAdmin = computed(() => state.user?.role === 'admin')

export const useAuthStore = () => {
  loadFromStorage()
  return {
    state: readonly(state),
    isAdmin,
    setAuth,
    updateUser,
    clearAuth,
  }
}
