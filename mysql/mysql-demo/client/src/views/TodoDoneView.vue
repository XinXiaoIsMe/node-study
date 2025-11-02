<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="done-page">
      <el-card class="done-card" shadow="hover">
        <div class="done-card__header">
          <h2>我的已办</h2>
          <p>回顾近期完成的任务，沉淀复盘经验</p>
        </div>
        <el-empty description="已办任务列表功能正在建设中" />
      </el-card>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.done-page {
  display: flex;
  justify-content: center;
  padding: clamp(24px, 5vw, 48px) 0;
}

.done-card {
  width: min(960px, 100%);
}

.done-card__header {
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
