<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import http from '../services/http'
import { formatDateTime } from '../utils/datetime'
import type { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled, Clock } from '@element-plus/icons-vue'

const calendarDate = ref(new Date())
const calendarRef = ref<any>(null)

const panelStart = ref<Date | null>(null)
const panelEnd = ref<Date | null>(null)

// format as YYYY-MM-DD HH:mm:ss with day start for range queries
function atStartOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0) }
const panelStartDate = computed(() => panelStart.value ? formatDateTime(atStartOfDay(panelStart.value)) : '')
// We send last visible day's start-of-day; server uses half-open upper bound < end + 1 day.
const panelEndDate = computed(() => panelEnd.value ? formatDateTime(atStartOfDay(panelEnd.value)) : '')

// ---- Tasks data & drawer ----
type Task = {
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

const tasksByDay = ref<Record<string, Task[]>>({})
const drawerVisible = ref(false)
const drawerDate = ref<string>('')
const drawerTasks = computed(() => tasksByDay.value[drawerDate.value] || [])

onMounted(() => {
  recomputePanelRange()
  fetchTasksByRange()
})

watch(calendarDate, () => {
  recomputePanelRange()
  fetchTasksByRange()
})

function ymd(d: Date) {
  const p = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

async function fetchTasksByRange() {
  if (!panelStartDate.value || !panelEndDate.value) return
  try {
    const { data } = await http.post<{ tasks: Task[] }>(
      '/tasks/range',
      {
        startDate: panelStartDate.value,
        endDate: panelEndDate.value,
      },
    )
    const map: Record<string, Task[]> = {}
    const startObj = panelStart.value ? atStartOfDay(panelStart.value) : null
    const endObj = panelEnd.value ? atStartOfDay(panelEnd.value) : null

    for (const t of data.tasks || []) {
      const hasStart = !!t.startDate
      const hasDue = !!t.dueDate

      if (!hasStart && !hasDue) {
        // daily recurring: place on every visible day
        if (startObj && endObj) {
          for (let d = new Date(startObj); d <= endObj; d.setDate(d.getDate() + 1)) {
            const key = ymd(d)
            ;(map[key] ||= []).push(t)
          }
        }
        continue
      }

      const dateStr = hasDue ? t.dueDate! : t.startDate!
      const d = new Date(dateStr)
      if (Number.isNaN(d.getTime())) continue
      const key = ymd(d)
      ;(map[key] ||= []).push(t)
    }

    // sort within day by time (prefer dueDate; fallback startDate)
    const getTime = (t: Task) => new Date(t.dueDate || t.startDate || 0).getTime()
    Object.values(map).forEach((arr) => arr.sort((a, b) => getTime(a) - getTime(b)))

    tasksByDay.value = map
  } catch (e: unknown) {
    const err = e as AxiosError
    const message = (err.response?.data as any)?.message || err.message || '获取任务失败'
    ElMessage.error(message)
  }
}

function openDayDrawer(day: string) {
  drawerDate.value = day
  drawerVisible.value = true
}

function recomputePanelRange() {
  const { start, end } = getPanelRange(calendarDate.value)
  panelStart.value = start
  panelEnd.value = end
}

function getPanelRange(date: Date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const monthStart = new Date(y, m, 1)
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const firstDay = monthStart.getDay() // 0..6, 0=Sun
  const offset = (firstDay - 0 + 7) % 7
  const start = new Date(y, m, 1 - offset)
  const used = offset + daysInMonth
  const remaining = 7 - (used % 7 || 7)
  const cells = used + remaining
  const end = new Date(start)
  end.setDate(start.getDate() + cells - 1)
  return { start, end }
}
</script>

<template>
  <AppLayout>
    <div class="calendar-page">
      <el-card class="calendar-card" shadow="hover">
        <div class="calendar-card__header">
          <h2>任务日历</h2>
          <p>以日历视图掌握任务节奏，合理规划时间</p>
        </div>
        <el-calendar ref="calendarRef" v-model="calendarDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell" @click="openDayDrawer(data.day)">
              <div class="calendar-cell__date">{{ new Date(data.date).getDate() }}</div>
              <ul class="calendar-cell__tasks">
                <li
                  v-for="t in (tasksByDay[data.day] || []).slice(0, 3)"
                  :key="t.id"
                  class="task-item"
                  :class="{
                    'not-current-month': data.type !== 'current-month'
                  }"
                >
                  <el-icon class="status" :class="t.status">
                    <CircleCheckFilled v-if="t.status === 'completed'" />
                    <Clock v-else />
                  </el-icon>
                  <span class="dot" :class="t.priority"></span>
                  <span class="title" :title="t.title">{{ t.title }}</span>
                </li>
                <li v-if="(tasksByDay[data.day] || []).length > 3" class="more">…</li>
              </ul>
            </div>
          </template>
        </el-calendar>

        <el-drawer
          v-model="drawerVisible"
          :with-header="true"
          :title="drawerDate + ' 的任务'"
          direction="rtl"
          size="420px"
        >
          <div v-if="drawerTasks.length === 0" class="drawer-empty">这一天没有任务</div>
          <el-timeline v-else>
            <el-timeline-item
              v-for="t in drawerTasks"
              :key="t.id"
              :type="t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'primary'"
              :hollow="t.status !== 'completed'"
              :timestamp="(t.dueDate || t.startDate) ? new Date(t.dueDate || t.startDate as string).toLocaleTimeString() : ''"
            >
              <div class="drawer-task">
                <div class="drawer-task__title">{{ t.title }}</div>
                <div v-if="t.description" class="drawer-task__desc">{{ t.description }}</div>
                <div class="drawer-task__meta">
                  <el-tag size="small" :type="t.status === 'completed' ? 'success' : 'info'">
                    {{ t.status === 'completed' ? '已完成' : '待处理' }}
                  </el-tag>
                  <span v-if="t.dueDate || t.startDate" class="time">{{ new Date(t.dueDate || t.startDate as string).toLocaleString() }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-drawer>
      </el-card>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.calendar-page {
  display: flex;
  justify-content: center;
  padding: clamp(24px, 5vw, 48px) 0;
}

.calendar-card {
  width: min(960px, 100%);
}

.calendar-card__header {
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 22px;
    color: #1f2e55;
    font-weight: 600;
  }

  p {
    margin: 6px 0 0;
    color: #5b6b83;
    font-size: 14px;
  }
}
</style>

<style lang="scss" scoped>
:deep(.el-calendar-day) {
  height: 120px;
}

.calendar-cell {
  position: relative;
  min-height: 96px; /* enough for 3 items + more line */
  padding: 6px 6px 6px 8px;
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden;
}
.calendar-cell__date {
  font-size: 12px;
  color: #64748b;
}
.calendar-cell__tasks {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 72px; /* 3 tasks + 1 more line */
  overflow: hidden;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #334155;
  overflow: hidden;

  &.not-current-month {
    opacity: .5;
  }
}
.task-item .status {
  color: #94a3b8; /* default pending color */
  font-size: 14px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
}
.task-item .status.completed { color: #10b981; }
.task-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex: 0 0 auto;
  min-width: 8px;
}
.task-item .dot.low { background-color: #38bdf8; }
.task-item .dot.medium { background-color: #f59e0b; }
.task-item .dot.high { background-color: #ef4444; }
.task-item .title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0;
}
.more { font-size: 12px; color: #94a3b8; }

.drawer-task__title { font-weight: 600; margin-bottom: 4px; }
.drawer-task__desc { color: #475569; font-size: 12px; margin-bottom: 4px; }
.drawer-task__meta { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 12px; }
.drawer-empty { color: #94a3b8; font-size: 13px; }
</style>
