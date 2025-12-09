<template>
  <AppLayout>
    <el-table v-loading="loading" :data="users">
      <el-table-column label="头像">
        <template #default="{ row }">
          <img style="width: 40px; height: 40px" :src="row.avatar" />
        </template>
      </el-table-column>
      <el-table-column prop="username" label="名称"></el-table-column>
      <el-table-column prop="nickname" label="昵称"></el-table-column>
      <el-table-column prop="normalizedGender" label="性别"></el-table-column>
      <el-table-column prop="normalizedRole" label="角色"></el-table-column>
      <el-table-column prop="self_intro" label="自我介绍"></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-icon @click="handleEditUser(row)">
            <Edit />
          </el-icon>
          <el-popconfirm
            title="确认删除此用户吗？"
            placement="bottom"
            confirm-button-text="确认"
            cancel-button-text="取消"
            :disabled="isDeleteDisabled(row)"
            @confirm="handleDeleteUser(row)"
          >
            <template #reference>
              <el-icon :class="{ 'is-disabled': isDeleteDisabled(row) }">
                <Delete />
              </el-icon>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </AppLayout>
  <el-dialog title="编辑用户" v-model="editFormVisible">
    <el-form ref="editFormRef" label-width="100px" :model="editForm" :rules="rules">
      <el-form-item label="名称" prop="username">
        <el-input v-model="editForm.username" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="editForm.nickname" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
          <el-select
            v-model="editForm.gender"
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
      <el-form-item label="角色" prop="role">
        <el-select v-model="editForm.role">
          <el-option label="管理员" value="admin"></el-option>
          <el-option label="普通用户" value="user"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="自我介绍" prop="self_intro">
        <el-input v-model="editForm.self_intro" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancelEdit">取消</el-button>
      <el-button type="primary" :disabled="isEditing" :loading="isEditing" @click="handleConfirmEdit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import { ElForm, ElMessage, type FormRules } from "element-plus";
import { Edit, Delete } from "@element-plus/icons-vue";
import type { Role } from "../stores/auth";
import http from "../services/http";
import AppLayout from "../components/AppLayout.vue";
import { useAuthStore } from "../stores/auth";

interface User {
  id: number;
  username: string;
  nickname: string | null;
  gender: number | null;
  self_intro: string | null;
  role: Role;
  avatar_mime: string | null;
  avatar_size: number | null;
  update_time: Date | null;
  avatarUpdatedAt: string | null;
}

interface UserRow extends User {
  normalizedGender: string;
  normalizedRole: string;
  avatar: string | null;
}

interface EditForm {
  id: number | null,
  username: string;
  nickname: string | null;
  gender: number | null;
  self_intro: string | null;
  role: Role;
}

const users = ref<UserRow[]>([]);
const loading = ref(false);
const API_BASE = (http.defaults.baseURL ?? "").replace(/\/$/, "");
const auth = useAuthStore();
const editForm = ref<EditForm>({
  id: null,
  username: '',
  nickname: '',
  gender: null,
  self_intro: '',
  role: 'user'
});
const editFormVisible = ref(false);
const isEditing = ref(false);
const editFormRef = useTemplateRef<InstanceType<typeof ElForm>>('editFormRef');

const rules: FormRules = {
  username: [
    { required: true, message: '请填写用户名', trigger: 'change' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

const genderOptions = [
  { label: "保密", value: null },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
];

onMounted(() => {
  getUsers();
});

async function getUsers() {
  try {
    loading.value = true;
    const res = await http.get<User[]>("/users");
    users.value = res.data.map((row) => ({
      ...row,
      avatar: getAvatar(row),
      normalizedGender: normalizeGender(row.gender),
      normalizedRole: normalizeRole(row.role),
    }));
  } catch (error) {
    ElMessage.error("获取用户信息失败！");
  } finally {
    loading.value = false;
  }
}

async function handleEditUser(row: UserRow) {
  editFormVisible.value = true;
  editForm.value = {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    gender: row.gender,
    self_intro: row.self_intro,
    role: row.role
  };
}

function handleCancelEdit () {
  editFormVisible.value = false;
}

async function handleConfirmEdit () {
  const isValid = await editFormRef.value!.validate().catch(() => false);
  if (!isValid) return;

  isEditing.value = true;
  try {
    const res = await http.put<{ message: string; }>('/users', {
      userId: editForm.value.id,
      username: editForm.value.username,
      nickname: editForm.value.nickname,
      gender: editForm.value.gender,
      role: editForm.value.role,
      self_intro: editForm.value.self_intro,
    });
    getUsers();
    editFormVisible.value = false;
    ElMessage.success(res.data.message);
  } catch (error) {
    ElMessage.error('修改用户信息失败！')
  } finally {
    isEditing.value = false;
  }
}

async function handleDeleteUser(row: UserRow) {
  try {
    loading.value = true;
    const res = await http.delete<{ message: string }>(`/users/${row.id}`);
    await getUsers();
    ElMessage.success(res.data.message);
  } catch (e) {
    ElMessage.error("删除用户失败");
  } finally {
    loading.value = false;
  }
}

function getAvatar(row: User) {
  const version = row.avatarUpdatedAt;
  if (!version) return null;

  const params = new URLSearchParams({
    userId: String(row.id),
    token: auth.state.token,
  });
  return `${API_BASE}/users/me/avatar?${params.toString()}`;
}

function normalizeGender(gender: number | null) {
  if (gender == 1) return "男";
  if (gender === 2) return "女";
  return "未知";
}

function normalizeRole(role: Role) {
  return role === "admin" ? "管理员" : "普通用户";
}

function isDeleteDisabled (row: UserRow) {
  return row.username === auth.state.user?.username || row.role === 'admin';
}
</script>

<style scoped>
.el-icon {
  font-size: 16px;
  margin-right: 4px;
  cursor: pointer;
}

.el-icon.is-disabled {
  cursor: not-allowed;
  opacity: .5;
}

img {
  user-select: none;
}
</style>
