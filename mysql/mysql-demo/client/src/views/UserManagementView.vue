<script setup lang="ts">
import { Hide, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormItemRule, FormRules } from "element-plus";
import { isAxiosError } from "axios";
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { type Role, useAuthStore } from "../stores/auth";
import http from "../services/http";
import AppLayout from "../components/AppLayout.vue";
import AvatarCropperDialog from "../components/AvatarCropperDialog.vue";

interface CreateUserForm {
  username: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  role: Role;
  gender: number | null;
  self_intro: string | null;
}

interface CreateUserResponse {
  user?: {
    username?: string;
  };
  message?: string;
}

const auth = useAuthStore();
const router = useRouter();

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "user", label: "普通用户" },
  { value: "admin", label: "系统管理员" },
];

const createForm = reactive<CreateUserForm>({
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  role: "user",
  gender: null,
  self_intro: null
});

const formRef = ref<FormInstance>();
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const avatarCropperVisible = ref(false);
const avatarCropperSource = ref<string | null>(null);
const avatarPreviewUrl = ref<string | null>(null);
const avatarDataUrl = ref<string | null>(null);
const avatarFileInputRef = ref<HTMLInputElement>();

const cleanupAvatarSource = () => {
  if (avatarCropperSource.value) {
    URL.revokeObjectURL(avatarCropperSource.value);
    avatarCropperSource.value = null;
  }
};

const resetAvatarState = () => {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value);
  }
  avatarPreviewUrl.value = null;
  avatarDataUrl.value = null;
};

onBeforeUnmount(() => {
  cleanupAvatarSource();
  resetAvatarState();
});

watch(avatarCropperVisible, (visible) => {
  if (!visible) {
    cleanupAvatarSource();
    if (avatarFileInputRef.value) {
      avatarFileInputRef.value.value = "";
    }
  }
});

const validateConfirmPassword: NonNullable<FormItemRule["validator"]> = (
  _rule,
  value: string,
  callback
) => {
  if (!value) {
    callback(new Error("请再次输入密码"));
    return;
  }
  if (value !== createForm.password) {
    callback(new Error("两次输入的密码不一致"));
    return;
  }
  callback();
};

const rules: FormRules<CreateUserForm> = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, message: "用户名至少 3 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入初始密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码以确认", trigger: "blur" },
    {
      validator: validateConfirmPassword,
      trigger: ["blur", "change"] as const,
    },
  ],
  nickname: [
    { max: 30, message: "昵称长度请控制在 30 个字符以内", trigger: "blur" },
  ],
};

const genderOptions = [
  { label: "保密", value: null },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
];

const currentUserName = computed(
  () => auth.state.user?.nickname || auth.state.user?.username || ""
);

const resetFeedback = () => {
  ElMessage.closeAll();
};

const resetForm = () => {
  formRef.value?.resetFields();
  createForm.username = "";
  createForm.password = "";
  createForm.confirmPassword = "";
  createForm.nickname = "";
  createForm.role = "user";
  createForm.gender = null;
  createForm.self_intro = null;
  resetAvatarState();
};

const redirectToLogin = () => {
  router.push({ name: "login", query: { redirect: "/users" } });
};

const ensureToken = () => {
  if (!auth.state.token) {
    ElMessage.error("登录状态已过期，请重新登录");
    redirectToLogin();
    return false;
  }
  return true;
};

const handleAvatarClick = () => {
  if (loading.value) {
    return;
  }
  avatarFileInputRef.value?.click();
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

  cleanupAvatarSource();
  avatarCropperSource.value = URL.createObjectURL(file);
  avatarCropperVisible.value = true;
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("读取文件失败"));
    reader.readAsDataURL(blob);
  });

const handleAvatarConfirm = async ({
  blob,
  previewUrl,
}: {
  blob: Blob;
  previewUrl: string;
}) => {
  avatarCropperVisible.value = false;
  if (blob.size > 2 * 1024 * 1024) {
    URL.revokeObjectURL(previewUrl);
    ElMessage.error("头像大小请控制在 2MB 以内");
    return;
  }
  try {
    const dataUrl = await blobToDataUrl(blob);
    resetAvatarState();
    avatarPreviewUrl.value = previewUrl;
    avatarDataUrl.value = dataUrl;
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    console.error("convert avatar failed", error);
    ElMessage.error("头像处理失败，请重试");
  }
};

const handleCreateUser = async () => {
  if (!formRef.value) {
    return;
  }

  resetFeedback();

  const isValid = await formRef.value.validate().catch(() => false);
  if (!isValid) {
    return;
  }

  if (!ensureToken()) {
    return;
  }

  loading.value = true;
  try {
    const { data } = await http.post<CreateUserResponse>("/users", {
      ...createForm,
      avatar: avatarDataUrl.value
    });

    ElMessage.success(
      `用户 ${data?.user?.username || createForm.username} 创建成功`
    );
    resetForm();
  } catch (error) {
    console.error("create user request failed", error);
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        return;
      }
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        (status === 401
          ? "登录状态已过期，请重新登录"
          : "创建用户失败，请稍后重试");
      ElMessage.error(message);
    } else {
      ElMessage.error("无法连接服务器，请检查网络或稍后再试");
    }
  } finally {
    loading.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

watch(
  () => createForm.password,
  () => {
    if (createForm.confirmPassword) {
      formRef.value?.validateField("confirmPassword").catch(() => {});
    }
  }
);
</script>

<template>
  <AppLayout>
    <div class="users-layout">
      <el-card class="users-card" shadow="hover">
        <template #header>
          <div class="users-card__header">
            <div>
              <h2>用户管理</h2>
              <p>仅系统管理员可创建并维护系统用户</p>
            </div>
            <el-tag type="danger">系统管理员</el-tag>
          </div>
        </template>

        <el-descriptions
          v-if="currentUserName"
          class="users-descriptions"
          :column="1"
          border
          size="small"
        >
          <el-descriptions-item label="当前管理员">
            {{ currentUserName }}
          </el-descriptions-item>
          <el-descriptions-item label="登录账号">
            {{ auth.state.user?.username }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="users-avatar">
          <div class="users-avatar__preview" @click="handleAvatarClick">
            <el-avatar :size="96" :src="avatarPreviewUrl || undefined">
              {{ createForm.nickname || createForm.username || "新" }}
            </el-avatar>
            <div class="users-avatar__overlay">
              <span>{{
                avatarPreviewUrl ? "点击更换头像" : "点击上传头像"
              }}</span>
            </div>
          </div>
          <input
            ref="avatarFileInputRef"
            class="sr-only"
            type="file"
            accept="image/*"
            @change="handleAvatarFileChange"
          />
          <el-text class="users-avatar__tips" type="info">
            头像可选，支持 JPG/PNG，文件大小建议小于 2MB。
          </el-text>
        </div>

        <el-form
          ref="formRef"
          :model="createForm"
          :rules="rules"
          label-position="top"
          size="large"
          @submit.prevent="handleCreateUser"
        >
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="createForm.username"
                  autocomplete="off"
                  placeholder="请输入新用户用户名"
                  maxlength="50"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="createForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="请输入初始密码"
                  maxlength="50"
                >
                  <template #suffix>
                    <el-icon
                      class="password-toggle"
                      :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                      role="button"
                      tabindex="0"
                      @click="togglePasswordVisibility"
                      @keydown.enter.prevent="togglePasswordVisibility"
                      @keydown.space.prevent="togglePasswordVisibility"
                    >
                      <component :is="showPassword ? Hide : View" />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="createForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="请再次输入密码"
                  maxlength="50"
                >
                  <template #suffix>
                    <el-icon
                      class="password-toggle"
                      :aria-label="
                        showConfirmPassword ? '隐藏密码' : '显示密码'
                      "
                      role="button"
                      tabindex="0"
                      @click="toggleConfirmPasswordVisibility"
                      @keydown.enter.prevent="toggleConfirmPasswordVisibility"
                      @keydown.space.prevent="toggleConfirmPasswordVisibility"
                    >
                      <component :is="showConfirmPassword ? Hide : View" />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="昵称（可选）" prop="nickname">
                <el-input
                  v-model="createForm.nickname"
                  autocomplete="off"
                  placeholder="填写用户昵称"
                  maxlength="30"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="角色" prop="role">
                <el-select v-model="createForm.role" placeholder="请选择角色">
                  <el-option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="性别" prop="gender">
                <el-select
                  v-model="createForm.gender"
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
            </el-col>
            <el-col>
              <el-form-item label="自我介绍" prop="self_intro">
                <el-input
                  v-model="createForm.self_intro"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" :loading="loading" native-type="submit">
              创建用户
            </el-button>
            <el-button :disabled="loading" @click="resetForm"> 重置 </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <AvatarCropperDialog
      v-model="avatarCropperVisible"
      :image-url="avatarCropperSource"
      title="裁剪头像"
      @confirm="handleAvatarConfirm"
    />
  </AppLayout>
</template>

<style lang="scss" scoped>
.users-layout {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 6vw, 64px) 0;
}

.users-card {
  width: min(720px, 100%);
}

.users-card__header {
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

.users-descriptions {
  margin-bottom: 24px;
}

.users-avatar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.users-avatar__preview {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(79, 108, 255, 0.25);
  cursor: pointer;

  &:hover .users-avatar__overlay {
    opacity: 1;
  }
}

.users-avatar__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 46, 85, 0.55);
  color: #ffffff;
  font-size: 12px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0 8px;
}

.users-avatar__tips {
  font-size: 12px;
  color: #7b869d;
}

.password-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3e7bfa;
  font-size: 18px;

  &:focus-visible {
    outline: 2px solid #3e7bfa;
    border-radius: 50%;
  }
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
  .users-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .users-layout {
    padding: 24px 0;
  }
}
</style>
