import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/todos',
      name: 'todos',
      meta: { requiresAuth: true },
      component: () => import('../views/TodoListView.vue'),
    },
    {
      path: '/done',
      name: 'done',
      meta: { requiresAuth: true },
      component: () => import('../views/TodoDoneView.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      meta: { requiresAuth: true },
      component: () => import('../views/TaskCalendarView.vue'),
    },
    {
      path: '/tasks/new',
      name: 'task-create',
      meta: { requiresAuth: true },
      component: () => import('../views/TaskCreateView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/UserManagementView.vue'),
    },
    {
      path: '/users/account',
      name: 'user-account',
      meta: { requiresAuth: true },
      component: () => import('../views/MyAccountView.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const requiresAuth = Boolean(to.meta.requiresAuth)
  const requiresAdmin = Boolean(to.meta.requiresAdmin)

  if (to.name === 'login' && auth.state.user) {
    next({ path: auth.isAdmin.value ? '/users' : '/todos' })
    return
  }

  if (requiresAuth && !auth.state.user) {
    const query =
      to.fullPath && to.fullPath !== '/login'
        ? { redirect: to.fullPath }
        : undefined
    next({
      name: 'login',
      ...(query ? { query } : {}),
    })
    return
  }

  if (requiresAdmin && !auth.isAdmin.value) {
    next({ path: '/todos' })
    return
  }

  next()
})

export default router
