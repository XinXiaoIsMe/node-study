import axios, { type AxiosProgressEvent } from 'axios';
import { ElMessage } from 'element-plus';

const http = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 60_000,
});

interface RequestData<T = unknown> {
  data: T;
  success: boolean;
  msg: string;
}

export interface UploadChunkPayload {
  chunk: Blob;
  chunkId: string;
  chunkIndex: number;
  fileHash: string;
  filename: string;
  totalChunks: number;
}

export interface UploadChunkOptions {
  signal?: AbortSignal;
  onProgress?: (event: AxiosProgressEvent) => void;
}

export interface MergePayload {
  fileHash: string;
  filename: string;
}

export async function getUploadedChunks(fileHash: string) {
  try {
    const response = await http.get<RequestData<string[]>>(`/getUploadedChunks/${fileHash}`);
    const payload = response.data;
    if (!payload.success) {
      ElMessage.error(payload.msg);
      return [];
    }
    return payload.data;
  }
  catch (e: any) {
    ElMessage.error(e.message);
    return [];
  }
}

export type UploadChunkResult = 'success' | 'canceled' | 'failed';

export async function uploadChunk(payload: UploadChunkPayload, options: UploadChunkOptions = {}): Promise<UploadChunkResult> {
  try {
    const formData = new FormData();
    formData.append('file', payload.chunk);
    formData.append('chunkId', payload.chunkId);
    formData.append('chunkIndex', String(payload.chunkIndex));
    formData.append('fileHash', payload.fileHash);
    formData.append('filename', payload.filename);
    formData.append('totalChunks', String(payload.totalChunks));
    const response = await http.post<RequestData<boolean>>('/upload', formData, {
      signal: options.signal,
      onUploadProgress: options.onProgress,
    });
    const result = response.data;
    if (!result.success) {
      ElMessage.error(result.msg);
      return 'failed';
    }
    return 'success';
  }
  catch (e: any) {
    if (axios.isCancel(e)) {
      return 'canceled';
    }
    ElMessage.error(e.message);
    return 'failed';
  }
}

export async function mergeChunks(payload: MergePayload) {
  try {
    const response = await http.post<RequestData<boolean>>('/merge', payload);
    const result = response.data;
    if (!result.success) {
      ElMessage.error(result.msg);
      return false;
    }
    return true;
  }
  catch (e: any) {
    ElMessage.error(e.message);
    return false;
  }
}
