<script setup lang="ts">
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { isAxiosError } from "axios";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import AppLayout from "../components/AppLayout.vue";
import AvatarCropperDialog from "../components/AvatarCropperDialog.vue";
import http from "../services/http";
import type { Role } from "../stores/auth";
import { useAuthStore } from "../stores/auth";

interface ProfileResponse {
  profile: {
    id: number;
    username: string;
    nickname: string | null;
    gender: number | null;
    selfIntro: string | null;
    role: Role;
    avatarUpdatedAt: string | null;
  };
}

const auth = useAuthStore();

const loadingProfile = ref(true);
const savingProfile = ref(false);
const avatarUploading = ref(false);

const profile = reactive({
  username: "",
  nickname: "" as string | null,
  gender: null as number | null,
  selfIntro: "" as string | null,
  role: "user" as Role,
  avatarUpdatedAt: null as string | null,
});

const formModel = reactive({
  nickname: "" as string,
  gender: null as number | null,
  selfIntro: "" as string,
});

const genderOptions = [
  { label: "保密", value: null },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
];

const formRef = ref<FormInstance>();
const fileInputRef = ref<HTMLInputElement>();
const cropperVisible = ref(false);
const cropperSource = ref<string | null>(null);
const localAvatarPreview = ref<string | null>(null);
let previewCleanupTimer: ReturnType<typeof window.setTimeout> | null = null;

const cleanupCropperSource = () => {
  if (cropperSource.value) {
    URL.revokeObjectURL(cropperSource.value);
    cropperSource.value = null;
  }
};

const revokePreview = () => {
  if (previewCleanupTimer !== null) {
    window.clearTimeout(previewCleanupTimer);
    previewCleanupTimer = null;
  }
  if (localAvatarPreview.value) {
    URL.revokeObjectURL(localAvatarPreview.value);
    localAvatarPreview.value = null;
  }
};

const schedulePreviewCleanup = () => {
  if (previewCleanupTimer !== null) {
    window.clearTimeout(previewCleanupTimer);
  }
  previewCleanupTimer = window.setTimeout(() => {
    revokePreview();
  }, 800);
};

onBeforeUnmount(() => {
  revokePreview();
  cleanupCropperSource();
});

watch(cropperVisible, (visible) => {
  if (!visible) {
    cleanupCropperSource();
  }
});

const API_BASE = (http.defaults.baseURL ?? "").replace(/\/$/, "");
const avatarUrl = computed(() => {
  if (localAvatarPreview.value) {
    return localAvatarPreview.value;
  }
  if (!profile.avatarUpdatedAt || !auth.state.token) {
    return null;
  }
  const params = new URLSearchParams({
    ts: profile.avatarUpdatedAt,
    token: auth.state.token,
  });
  return `${API_BASE}/users/me/avatar?${params.toString()}`;
});

const rules: FormRules<typeof formModel> = {
  nickname: [{ max: 32, message: "昵称长度需小于 32 个字符", trigger: "blur" }],
  selfIntro: [
    { max: 255, message: "自我介绍不超过 255 个字符", trigger: "blur" },
  ],
};

const applyProfile = (payload: ProfileResponse["profile"]) => {
  const normalizedGender =
    payload.gender && payload.gender > 0 ? payload.gender : null;

  profile.username = payload.username;
  profile.nickname = payload.nickname;
  profile.gender = normalizedGender;
  profile.selfIntro = payload.selfIntro ?? null;
  profile.role = payload.role;
  profile.avatarUpdatedAt = payload.avatarUpdatedAt;

  formModel.nickname = payload.nickname || "";
  formModel.gender = normalizedGender;
  formModel.selfIntro = payload.selfIntro || "";

  auth.updateUser({
    nickname: payload.nickname ?? null,
    gender: normalizedGender,
    selfIntro: payload.selfIntro ?? null,
    avatarUpdatedAt: payload.avatarUpdatedAt ?? null,
  });

  schedulePreviewCleanup();
};

const fetchProfile = async () => {
  loadingProfile.value = true;
  try {
    const { data } = await http.get<ProfileResponse>("/users/me");
    if (data.profile) {
      applyProfile(data.profile);
    }
  } catch (error) {
    console.error("fetch profile failed", error);
    ElMessage.error("获取账号信息失败，请稍后重试");
  } finally {
    loadingProfile.value = false;
  }
};

onMounted(fetchProfile);

const handleSaveProfile = async () => {
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }
  savingProfile.value = true;
  try {
    const { data } = await http.put<ProfileResponse>("/users/me", {
      nickname: formModel.nickname.trim() || null,
      gender: formModel.gender,
      selfIntro: formModel.selfIntro.trim() || null,
    });
    if (data.profile) {
      applyProfile(data.profile);
      ElMessage.success("资料已更新");
    }
  } catch (error) {
    console.error("update profile failed", error);
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "资料更新失败，请稍后重试";
      ElMessage.error(message);
    } else {
      ElMessage.error("无法连接服务器，请稍后重试");
    }
  } finally {
    savingProfile.value = false;
  }
};

const handleAvatarClick = () => {
  if (avatarUploading.value) {
    return;
  }
  fileInputRef.value?.click();
};

const handleAvatarFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    ElMessage.error("请选择图片文件");
    target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error("图片大小请控制在 2MB 以内");
    target.value = "";
    return;
  }

  cleanupCropperSource();
  const objectUrl = URL.createObjectURL(file);
  cropperSource.value = objectUrl;
  cropperVisible.value = true;
};

const handleAvatarConfirm = async ({
  blob,
  previewUrl,
}: {
  blob: Blob;
  previewUrl: string;
}) => {
  cropperVisible.value = false;
  if (!blob) {
    return;
  }

  if (blob.size > 2 * 1024 * 1024) {
    URL.revokeObjectURL(previewUrl);
    ElMessage.error("头像大小请控制在 2MB 以内");
    return;
  }

  avatarUploading.value = true;
  localAvatarPreview.value = previewUrl;

  try {
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");

    const { data } = await http.post<ProfileResponse>(
      "/users/me/avatar",
      formData
    );
    if (data.profile) {
      applyProfile(data.profile);
      ElMessage.success("头像已更新");
    }
  } catch (error) {
    revokePreview();
    console.error("upload avatar failed", error);
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "头像上传失败，请重试";
      ElMessage.error(message);
    } else {
      ElMessage.error("上传头像失败，请稍后再试");
    }
  } finally {
    avatarUploading.value = false;
  }
};

watch(cropperVisible, (value) => {
  if (!value && fileInputRef.value) {
    fileInputRef.value.value = "";
  }
});
</script>

<template>
  <AppLayout>
    <div class="account-view" v-loading="loadingProfile">
      <el-card class="account-card" shadow="hover">
        <template #header>
          <div class="account-card__header">
            <div>
              <h2>我的账号</h2>
              <p>管理个人资料与头像信息</p>
            </div>
            <el-tag :type="profile.role === 'admin' ? 'danger' : 'info'">
              {{ profile.role === "admin" ? "系统管理员" : "普通用户" }}
            </el-tag>
          </div>
        </template>

        <div class="account-content">
          <section class="account-avatar">
            <div
              class="account-avatar__preview"
              :class="{ 'is-uploading': avatarUploading }"
              @click="handleAvatarClick"
            >
              <el-avatar
                :size="112"
                shape="square"
                :src="avatarUrl || undefined"
              >
                {{ profile.nickname || profile.username }}
              </el-avatar>
              <div class="account-avatar__overlay">
                <span>{{
                  avatarUploading ? "上传中..." : "点击头像上传/更新"
                }}</span>
              </div>
            </div>
            <input
              ref="fileInputRef"
              class="sr-only"
              type="file"
              accept="image/*"
              @change="handleAvatarFileChange"
            />
            <el-text class="account-avatar__tips" type="info">
              支持 JPG/PNG，建议尺寸不超过 480px，文件小于 2MB。
            </el-text>
          </section>

          <el-divider />

          <el-form
            ref="formRef"
            :model="formModel"
            :rules="rules"
            label-width="96px"
            label-position="left"
            :disabled="savingProfile || loadingProfile"
            class="account-form"
          >
            <el-form-item label="用户名">
              <el-input :model-value="profile.username" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="formModel.nickname"
                maxlength="32"
                placeholder="填写昵称（可选）"
              />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select
                v-model="formModel.gender"
                placeholder="选择性别"
                clearable
              >
                <el-option
                  v-for="option in genderOptions"
                  :key="String(option.value)"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="自我介绍" prop="selfIntro">
              <el-input
                v-model="formModel.selfIntro"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 6 }"
                maxlength="255"
                show-word-limit
                placeholder="可以介绍一下自己，便于团队协作（可选）"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="savingProfile"
                @click="handleSaveProfile"
              >
                保存修改
              </el-button>
              <el-button
                :disabled="savingProfile"
                @click="
                  () => {
                    formModel.nickname = profile.nickname || '';
                    formModel.gender = profile.gender;
                    formModel.selfIntro = profile.selfIntro || '';
                    formRef?.clearValidate();
                  }
                "
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
    <AvatarCropperDialog
      v-model="cropperVisible"
      :image-url="cropperSource"
      title="裁剪头像"
      @confirm="handleAvatarConfirm"
    />
  </AppLayout>
</template>

<style lang="scss" scoped>
.account-view {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(32px, 6vw, 64px) 0;
}

.account-card {
  width: min(720px, 100%);
}

.account-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #1f2e55;
    font-weight: 600;
  }

  p {
    margin: 6px 0 0;
    color: #5b6b83;
    font-size: 14px;
  }
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-avatar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.account-avatar__preview {
  position: relative;
  width: 112px;
  height: 112px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(79, 108, 255, 0.25);
  cursor: pointer;

  &:hover .account-avatar__overlay {
    opacity: 1;
  }

  &.is-uploading {
    pointer-events: none;
  }
}

.account-avatar__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 46, 85, 0.55);
  color: #ffffff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s ease;

  /* keep overlay corners consistent with square avatar */
  border-radius: 8px;

  span {
    padding: 0 12px;
    text-align: center;
    line-height: 1.4;
  }

  .account-avatar__preview.is-uploading & {
    opacity: 1;
  }
}

.account-avatar__tips {
  font-size: 12px;
  color: #7b869d;
}

.account-form {
  max-width: 520px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .account-avatar {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-avatar__preview {
    align-self: center;
  }
}

/* Ensure avatar image is centered and covers square container */
:deep(.el-avatar) {
  border-radius: 8px;
}

:deep(.el-avatar__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
}
</style>
