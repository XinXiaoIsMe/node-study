<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'

interface ConfirmPayload {
  blob: Blob
  previewUrl: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    imageUrl: string | null
    title?: string
  }>(),
  {
    title: '编辑头像',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: ConfirmPayload): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const imageRef = ref<HTMLImageElement | null>(null)
const stageRef = ref<HTMLDivElement | null>(null)
const naturalSize = reactive({ width: 1, height: 1 })
const scale = ref(1)
const rotation = ref(0)
const offset = reactive({ x: 0, y: 0 })
const dragging = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const offsetStart = reactive({ x: 0, y: 0 })
const pointerId = ref<number | null>(null)
const loading = ref(false)
const cropSize = ref(320)

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const resetState = () => {
  scale.value = 1
  rotation.value = 0
  offset.x = 0
  offset.y = 0
}

// Measure current crop stage size for precise math
const measureCropSize = () => {
  const el = stageRef.value
  if (!el) return
  const width = Math.max(1, Math.round(el.clientWidth))
  cropSize.value = width
}

const baseScale = computed(() => {
  const { width, height } = naturalSize
  if (!width || !height) {
    return 1
  }
  return Math.max(cropSize.value / width, cropSize.value / height)
})

const displayScale = computed(() => baseScale.value * scale.value)

const imageTransform = computed(() => {
  const center = 'translate(-50%, -50%)'
  const translate = `translate(${offset.x}px, ${offset.y}px)`
  const rotate = `rotate(${rotation.value}deg)`
  const scaleValue = `scale(${displayScale.value})`
  return `${center} ${translate} ${rotate} ${scaleValue}`
})

const handleImageLoad = () => {
  const img = imageRef.value
  if (!img) return
  naturalSize.width = img.naturalWidth || 1
  naturalSize.height = img.naturalHeight || 1
  resetState()
  measureCropSize()
}

const disposeDragging = (event: PointerEvent) => {
  const stage = stageRef.value
  if (stage && pointerId.value !== null) {
    try {
      stage.releasePointerCapture(pointerId.value)
    } catch (_) {}
  }
  pointerId.value = null
  dragging.value = false
}

const handlePointerDown = (event: PointerEvent) => {
  if (!visible.value) return
  const stage = stageRef.value
  if (!stage) return
  event.preventDefault()
  pointerId.value = event.pointerId
  dragStart.x = event.clientX
  dragStart.y = event.clientY
  offsetStart.x = offset.x
  offsetStart.y = offset.y
  dragging.value = true
  try {
    stage.setPointerCapture(event.pointerId)
  } catch (_) {}
}

const handlePointerMove = (event: PointerEvent) => {
  if (!dragging.value || pointerId.value !== event.pointerId) {
    return
  }
  const dx = event.clientX - dragStart.x
  const dy = event.clientY - dragStart.y
  offset.x = offsetStart.x + dx
  offset.y = offsetStart.y + dy
}

const handlePointerUp = (event: PointerEvent) => {
  if (pointerId.value !== event.pointerId) {
    return
  }
  disposeDragging(event)
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.08 : 0.08
  scale.value = clamp(scale.value + delta, 1, 3)
}

const handleZoom = (delta: number) => {
  scale.value = clamp(scale.value + delta, 1, 3)
}

const handleRotate = (delta: number) => {
  rotation.value = ((rotation.value + delta) % 360 + 360) % 360
}

const handleReset = () => {
  resetState()
}

watch(
  () => props.imageUrl,
  () => {
    if (!props.imageUrl) {
      resetState()
    }
  },
)

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      nextTick(() => {
        resetState()
        measureCropSize()
        window.addEventListener('resize', measureCropSize)
      })
    } else {
      resetState()
      window.removeEventListener('resize', measureCropSize)
    }
  },
)

onBeforeUnmount(() => {
  resetState()
  window.removeEventListener('resize', measureCropSize)
})

const handleConfirm = async () => {
  const img = imageRef.value
  if (!img) {
    ElMessage.error('图片尚未加载完成')
    return
  }
  loading.value = true
  try {
    const canvasSize = 480
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法获取画布上下文')
    }

    const offsetScale = canvasSize / cropSize.value
    const translateX = offset.x * offsetScale
    const translateY = offset.y * offsetScale
    const actualScale = displayScale.value * (canvasSize / cropSize.value)
    const rotationRad = (rotation.value * Math.PI) / 180

    ctx.save()
    ctx.translate(canvasSize / 2 + translateX, canvasSize / 2 + translateY)
    ctx.rotate(rotationRad)
    ctx.scale(actualScale, actualScale)
    ctx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2)
    ctx.restore()

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('生成头像失败，请重试'))
          return
        }
        const previewUrl = URL.createObjectURL(blob)
        emit('confirm', { blob, previewUrl })
        resolve()
      }, 'image/jpeg', 0.88)
    })
    visible.value = false
  } catch (error) {
    console.error('crop avatar failed', error)
    ElMessage.error((error as Error).message || '头像裁剪失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="560px"
    destroy-on-close
    class="avatar-cropper-dialog"
  >
    <div v-if="imageUrl" class="cropper">
      <div
        ref="stageRef"
        class="cropper__stage"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
        @pointercancel="handlePointerUp"
        @wheel.prevent="handleWheel"
      >
        <div
          class="cropper__image"
          :style="{ transform: imageTransform }"
        >
          <img
            ref="imageRef"
            :src="imageUrl"
            alt="待裁剪头像"
            @load="handleImageLoad"
          />
        </div>
        <div class="cropper__mask"></div>
      </div>
      <div class="cropper__controls">
        <div class="cropper__control">
          <span>缩放</span>
          <el-slider
            v-model="scale"
            :min="1"
            :max="3"
            :step="0.01"
          />
          <el-button-group>
            <el-button size="small" @click="handleZoom(-0.1)">-</el-button>
            <el-button size="small" @click="handleZoom(0.1)">+</el-button>
          </el-button-group>
        </div>
        <div class="cropper__control">
          <span>旋转</span>
          <el-slider
            v-model="rotation"
            :min="-180"
            :max="180"
            :step="1"
          />
          <el-button-group>
            <el-button size="small" @click="handleRotate(-90)">左旋</el-button>
            <el-button size="small" @click="handleRotate(90)">右旋</el-button>
            <el-button size="small" @click="handleReset">重置</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div v-else class="cropper-empty">
      <el-empty description="请先选择图片文件" />
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">
        保存头像
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.cropper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.cropper__stage {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 8px;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.12), rgba(31, 46, 85, 0.65));
  cursor: grab;
}

.cropper__stage:active {
  cursor: grabbing;
}

.cropper__image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  will-change: transform;
}

.cropper__image img {
  display: block;
  max-width: none;
  user-select: none;
  pointer-events: none;
}

.cropper__mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: 0 0 0 999px rgba(17, 26, 45, 0.45);
  border-radius: 8px;
}

.cropper__controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cropper__control {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 12px;
}

.cropper__control span {
  font-size: 13px;
  color: #5b6b83;
}

.cropper-empty {
  padding: 40px 0;
}

@media (max-width: 520px) {
  .cropper__stage {
    width: min(280px, 100%);
    height: min(280px, 100%);
  }
}
</style>
