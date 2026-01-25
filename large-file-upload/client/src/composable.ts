import pLimit from 'p-limit';
import SparkMD5 from 'spark-md5';
import { computed, ref, shallowRef } from 'vue';
import { getUploadedChunks, mergeChunks, uploadChunk } from './api';
import type { UploadChunkPayload, UploadChunkResult } from './api';

export interface FileHashOptions {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface UseLargeFileUploaderOptions {
  chunkSize?: number;
  concurrency?: number;
}

export type UploadStatus = 'idle' | 'hashing' | 'checking' | 'uploading' | 'paused' | 'success' | 'error';

export class UploadPausedError extends Error {
  constructor() {
    super('上传已暂停');
    this.name = 'UploadPausedError';
  }
}

export function isUploadPausedError(error: unknown): error is UploadPausedError {
  return error instanceof UploadPausedError;
}

interface InternalChunk {
  payload: UploadChunkPayload;
  size: number;
  loaded: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

export function calcFileMD5(file: File, options: FileHashOptions = {}) {
  const { onProgress, signal } = options;
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const totalChunks = Math.ceil(file.size / chunkSize);
  const spark = new SparkMD5.ArrayBuffer();
  const reader = new FileReader();
  let currentChunk = 0;

  const readChunk = () => {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    reader.readAsArrayBuffer(file.slice(start, end));
  };

  return new Promise<string>((resolve, reject) => {
    const abortHandler = () => {
      reader.abort();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      if (signal.aborted)
        return abortHandler();
      signal.addEventListener('abort', abortHandler, { once: true });
    }

    reader.onerror = () => {
      if (signal)
        signal.removeEventListener('abort', abortHandler);
      reject(reader.error ?? new Error('文件读取失败'));
    };

    reader.onload = (event) => {
      spark.append(event.target?.result as ArrayBuffer);
      currentChunk++;
      onProgress?.(Math.min(100, Math.round((currentChunk / totalChunks) * 100)));

      if (currentChunk < totalChunks) {
        readChunk();
      }
      else {
        if (signal)
          signal.removeEventListener('abort', abortHandler);
        resolve(spark.end());
      }
    };

    readChunk();
  });
}

export function useLargeFileUploader(options: UseLargeFileUploaderOptions = {}) {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const concurrency = options.concurrency ?? 6;
  const status = ref<UploadStatus>('idle');
  const hashProgress = ref(0);
  const percentage = ref(0);
  const errorMessage = ref('');
  const currentFile = shallowRef<File | null>(null);
  const fileHash = ref('');
  const chunks = shallowRef<InternalChunk[]>([]);
  const uploadedBytes = ref(0);
  let limit = pLimit(concurrency);
  const activeControllers = new Map<string, AbortController>();
  const isPaused = ref(false);

  const isProcessing = computed(() => ['hashing', 'checking', 'uploading'].includes(status.value));
  const canPause = computed(() => status.value === 'uploading');
  const canResume = computed(() => status.value === 'paused');

  const resetState = () => {
    status.value = 'idle';
    hashProgress.value = 0;
    percentage.value = 0;
    errorMessage.value = '';
    currentFile.value = null;
    fileHash.value = '';
    chunks.value = [];
    uploadedBytes.value = 0;
    isPaused.value = false;
    activeControllers.clear();
    limit = pLimit(concurrency);
  };

  const updatePercentage = () => {
    const total = currentFile.value?.size ?? 0;
    percentage.value = total === 0 ? 0 : Math.min(100, Math.round((uploadedBytes.value / total) * 100));
  };

  const buildChunks = (file: File, hash: string) => {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const result: InternalChunk[] = [];
    for (let index = 0; index < totalChunks; index++) {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      result.push({
        payload: {
          chunk: file.slice(start, end),
          chunkId: `${hash}-${index}`,
          chunkIndex: index,
          fileHash: hash,
          filename: file.name,
          totalChunks,
        },
        size: end - start,
        loaded: 0,
        status: 'pending',
      });
    }
    return result;
  };

  const markUploadedChunks = (uploadedIds: string[]) => {
    if (uploadedIds.length === 0)
      return;
    const uploadedSet = new Set(uploadedIds);
    for (const chunk of chunks.value) {
      if (uploadedSet.has(chunk.payload.chunkId)) {
        chunk.status = 'success';
        chunk.loaded = chunk.size;
        uploadedBytes.value += chunk.size;
      }
    }
    updatePercentage();
  };

  const revertChunkProgress = (chunk: InternalChunk) => {
    if (chunk.loaded === 0)
      return;
    uploadedBytes.value = Math.max(0, uploadedBytes.value - chunk.loaded);
    chunk.loaded = 0;
    updatePercentage();
  };

  const pause = () => {
    if (status.value !== 'uploading')
      return;
    isPaused.value = true;
    status.value = 'paused';
    for (const controller of activeControllers.values())
      controller.abort();
  };

  const handleUploadError = (error: unknown): never => {
    if (error instanceof UploadPausedError)
      throw error;
    if (status.value !== 'success')
      status.value = 'error';
    errorMessage.value = (error instanceof Error ? error.message : '上传失败');
    throw (error instanceof Error ? error : new Error('上传失败'));
  };

  const uploadSingleChunk = async (chunk: InternalChunk) => {
    if (isPaused.value)
      throw new UploadPausedError();
    chunk.status = 'uploading';
    chunk.loaded = 0;
    const controller = new AbortController();
    activeControllers.set(chunk.payload.chunkId, controller);

    try {
      const result: UploadChunkResult = await uploadChunk(chunk.payload, {
        signal: controller.signal,
        onProgress: (event) => {
          if (!event)
            return;
          const loaded = Math.min(chunk.size, event.loaded ?? 0);
          const delta = loaded - chunk.loaded;
          if (delta > 0) {
            chunk.loaded = loaded;
            uploadedBytes.value += delta;
            updatePercentage();
          }
        },
      });

      if (result === 'canceled') {
        revertChunkProgress(chunk);
        chunk.status = 'pending';
        throw new UploadPausedError();
      }

      if (result === 'failed') {
        chunk.status = 'error';
        throw new Error(`切片 ${chunk.payload.chunkIndex + 1} 上传失败`);
      }

      if (chunk.loaded < chunk.size) {
        uploadedBytes.value += (chunk.size - chunk.loaded);
        chunk.loaded = chunk.size;
        updatePercentage();
      }
      chunk.status = 'success';
    }
    finally {
      activeControllers.delete(chunk.payload.chunkId);
    }
  };

  const finalizeUpload = async () => {
    const merged = await mergeChunks({
      fileHash: fileHash.value,
      filename: currentFile.value?.name ?? '',
    });
    if (!merged) {
      throw new Error('合并切片失败');
    }
    status.value = 'success';
    percentage.value = 100;
  };

  const uploadChunks = async () => {
    isPaused.value = false;
    limit = pLimit(concurrency);
    const targets = chunks.value.filter(chunk => chunk.status !== 'success');
    if (targets.length === 0) {
      await finalizeUpload();
      return;
    }
    status.value = 'uploading';
    await Promise.all(targets.map(chunk => limit(() => uploadSingleChunk(chunk))));
    await finalizeUpload();
  };

  const prepareChunks = async (file: File) => {
    resetState();
    status.value = 'hashing';
    currentFile.value = file;
    const hash = await calcFileMD5(file, {
      chunkSize,
      onProgress: (progress) => {
        hashProgress.value = progress;
      },
    });
    fileHash.value = hash;
    chunks.value = buildChunks(file, hash);
    status.value = 'checking';
    const uploadedIds = await getUploadedChunks(hash);
    markUploadedChunks(uploadedIds);
  };

  const upload = async (file: File) => {
    try {
      await prepareChunks(file);
      await uploadChunks();
    }
    catch (error) {
      handleUploadError(error);
    }
  };

  const resume = async () => {
    if (!currentFile.value)
      throw new Error('暂无可续传文件');
    if (status.value !== 'paused')
      return;
    try {
      await uploadChunks();
    }
    catch (error) {
      handleUploadError(error);
    }
  };

  return {
    upload,
    pause,
    resume,
    status,
    hashProgress,
    percentage,
    isProcessing,
    errorMessage,
    canPause,
    canResume,
  };
}
