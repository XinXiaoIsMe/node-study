<script setup lang="ts">
import { useTemplateRef } from 'vue';

const emit = defineEmits<{
  confirm: [File];
  cancel: [];
}>();

const uploadInputRef = useTemplateRef<HTMLInputElement>('uploadInputRef');

function startUpload () {
  uploadInputRef.value?.click();
}

function handleUplaod (e: Event) {
  const files = (e.target as HTMLInputElement)!.files;
  if (files && files.length > 0) {
    emit('confirm', files[0]!);
  } else {
    emit('cancel');
  }
}
</script>

<template>
  <el-button @click="startUpload">上传文件</el-button>
  <input type="file" class="upload-input" ref="uploadInputRef" @change="handleUplaod" />
</template>

<style>
  .upload-input {
    width: 0;
    height: 0;
    visibility: hidden;
  }
</style>
