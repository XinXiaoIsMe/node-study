<script lang="ts" setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import Upload from './components/Upload.vue';
import { isUploadPausedError, useLargeFileUploader } from './composable';

const { upload, pause, resume, status, hashProgress, percentage, errorMessage, canPause, canResume } = useLargeFileUploader({
  chunkSize: 2 * 1024 * 1024,
  concurrency: 6,
});

const statusText = computed(() => {
  switch (status.value) {
    case 'hashing':
      return '正在计算文件指纹';
    case 'checking':
      return '正在校验已上传分片';
    case 'uploading':
      return '上传中';
    case 'paused':
      return '上传已暂停';
    case 'success':
      return '上传完成';
    case 'error':
      return '上传失败';
    default:
      return '等待开始';
  }
});

async function handleUpload(file: File) {
  try {
    await upload(file);
    ElMessage.success('上传成功！');
  } catch (error: any) {
    if (isUploadPausedError(error)) {
      ElMessage.info('上传已暂停');
      return;
    }
    ElMessage.error(error?.message ?? '上传失败');
  }
}

function handlePause() {
  if (!canPause.value)
    return;
  pause();
  if (status.value === 'paused')
    ElMessage.info('上传已暂停');
}

async function handleResume() {
  if (!canResume.value)
    return;
  try {
    await resume();
    ElMessage.success('上传成功！');
  } catch (error: any) {
    if (isUploadPausedError(error)) {
      ElMessage.info('上传已暂停');
      return;
    }
    ElMessage.error(error?.message ?? '上传失败');
  }
}
</script>

<template>
  <div class="upload-page">
    <Upload @confirm="handleUpload" />
    <div class="status">
      <p>
        状态：{{ statusText }}
      </p>
      <p v-if="status === 'hashing'">
        指纹计算进度：{{ hashProgress }}%
      </p>
      <p v-if="status === 'uploading' || status === 'paused'">
        上传进度：{{ percentage }}%
      </p>
      <p v-if="status === 'error'" class="error-text">
        {{ errorMessage }}
      </p>
    </div>
    <div class="controls">
      <el-button v-if="canPause" @click="handlePause">
        暂停上传
      </el-button>
      <el-button v-if="canResume" type="primary" @click="handleResume">
        继续上传
      </el-button>
    </div>
    <el-progress :percentage="percentage" :status="status === 'success' ? 'success' : undefined" />
  </div>
</template>

<style scoped>
.upload-page {
  padding: 40px;
}

.status {
  margin: 20px 0 12px;
  color: #606266;
  line-height: 1.8;
}

.controls {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.error-text {
  color: #f56c6c;
}
</style>
