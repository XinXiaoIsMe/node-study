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
            @confirm="handleDeleteUser(row)"
          >
            <template #reference>
              <el-icon>
                <Delete />
              </el-icon>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
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

const users = ref<UserRow[]>([]);
const loading = ref(false);
const API_BASE = (http.defaults.baseURL ?? "").replace(/\/$/, "");
const auth = useAuthStore();

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

async function handleEditUser(row: UserRow) {}

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
  if (gender === 0) return "女";
  if (gender == 1) return "男";
  return "未知";
}

function normalizeRole(role: Role) {
  return role === "admin" ? "管理员" : "普通用户";
}
</script>

<style scoped>
.el-icon {
  font-size: 16px;
  margin-right: 4px;
  cursor: pointer;
}
</style>
