<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const calendarDate = ref(new Date())
</script>

<template>
  <AppLayout>
    <div class="calendar-page">
      <el-card class="calendar-card" shadow="hover">
        <div class="calendar-card__header">
          <h2>任务日历</h2>
          <p>以日历视图掌握任务节奏，合理规划时间</p>
        </div>
        <el-calendar v-model="calendarDate" />
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
