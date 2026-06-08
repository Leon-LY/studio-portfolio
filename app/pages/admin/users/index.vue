<template>
  <div>
    <AdminHeader title="用户管理" />

    <div class="p-6">
      <!-- 搜索 + 新建 -->
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="relative max-w-xs w-full">
          <Icon name="lucide:search" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input v-model="search" type="text" placeholder="搜索用户..." class="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-sm bg-white placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-colors" />
        </div>
        <BaseButton size="sm" @click="openCreateForm">
          <Icon name="lucide:user-plus" size="16" class="mr-1" /> 新增用户
        </BaseButton>
      </div>

      <!-- 用户列表 -->
      <div v-if="filteredUsers.length > 0" class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-stone-100">
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3">用户</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">角色</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">创建时间</th>
              <th class="text-right text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-stone-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                    <Icon name="lucide:user" size="14" class="text-stone-500" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-stone-800">{{ u.full_name || u.email.split('@')[0] }}</p>
                    <p class="text-xs text-stone-400">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="inline-flex px-2 py-0.5 text-xs rounded-full"
                  :class="u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'"
                >
                  {{ u.role === 'admin' ? '管理员' : '编辑者' }}
                </span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="text-xs text-stone-500">{{ formatDate(u.created_at) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <BaseButton variant="ghost" size="sm" @click="openEditForm(u)">
                    编辑
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="openPasswordForm(u)">
                    改密
                  </BaseButton>
                  <button
                    class="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                    :disabled="u.id === currentUserId"
                    :title="u.id === currentUserId ? '不能删除自己' : '删除'"
                    @click="confirmDeleteUser = u"
                  >
                    <Icon name="lucide:trash-2" size="14" :class="u.id === currentUserId ? 'text-stone-300' : 'text-red-500'" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else-if="users.length === 0"
        icon="lucide:users"
        title="暂无用户"
        description="添加管理员或编辑者账号。"
        wrapper-class="py-12"
      />
      <EmptyState
        v-else-if="filteredUsers.length === 0"
        icon="lucide:search"
        title="未找到用户"
        :description="`没有匹配「${search}」的用户`"
        wrapper-class="py-12"
      />
    </div>

    <!-- 新增/编辑用户 Modal -->
    <BaseModal v-model="showUserForm" :title="editingUser ? '编辑用户' : '新增用户'" content-class="w-full max-w-sm">
      <form @submit.prevent="handleUserSubmit" class="space-y-4">
        <BaseInput v-model="userForm.email" label="邮箱" type="email" placeholder="user@example.com" :disabled="!!editingUser" required />
        <BaseInput v-if="!editingUser" v-model="userForm.password" label="密码" type="password" placeholder="至少6位" required />
        <BaseInput v-model="userForm.full_name" label="姓名" placeholder="用户姓名" />
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-stone-700">角色</label>
          <select v-model="userForm.role" class="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600">
            <option value="editor">编辑者 — 可管理项目和内容</option>
            <option value="admin">管理员 — 可管理所有内容和用户</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showUserForm = false">取消</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ editingUser ? '保存' : '创建' }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- 修改密码 Modal -->
    <BaseModal v-model="showPasswordForm" :title="`修改密码 — ${passwordUser?.full_name || passwordUser?.email}`" content-class="w-full max-w-sm">
      <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
        <BaseInput
          v-if="passwordUser?.id === currentUserId"
          v-model="passwordForm.current_password"
          label="当前密码"
          type="password"
          placeholder="输入当前密码"
          required
        />
        <BaseInput v-model="passwordForm.new_password" label="新密码" type="password" placeholder="至少6位" required />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showPasswordForm = false">取消</BaseButton>
          <BaseButton type="submit" :loading="savingPwd">修改密码</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- 删除确认 -->
    <ConfirmDialog
      v-if="confirmDeleteUser"
      :model-value="true"
      title="删除用户"
      :message="`确定要删除用户「${confirmDeleteUser.full_name || confirmDeleteUser.email}」吗？此操作不可撤销。`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="confirmDeleteUser = null"
      @confirm="handleDeleteUser"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const { user } = useAuth()
const currentUserId = computed(() => user.value?.id || '')

interface UserRow {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

const users = ref<UserRow[]>([])
const search = ref('')
const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(u => u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})
const showUserForm = ref(false)
const showPasswordForm = ref(false)
const editingUser = ref<UserRow | null>(null)
const passwordUser = ref<UserRow | null>(null)
const confirmDeleteUser = ref<UserRow | null>(null)
const saving = ref(false)
const savingPwd = ref(false)

const userForm = reactive({ email: '', password: '', full_name: '', role: 'editor' })
const passwordForm = reactive({ current_password: '', new_password: '' })

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  try {
    users.value = await adminApi.getUsers()
  } catch (e: any) {
    console.error('Failed to load users:', e)
  }
}

function openCreateForm() {
  editingUser.value = null
  userForm.email = ''
  userForm.password = ''
  userForm.full_name = ''
  userForm.role = 'editor'
  showUserForm.value = true
}

function openEditForm(u: UserRow) {
  editingUser.value = u
  userForm.email = u.email
  userForm.password = ''
  userForm.full_name = u.full_name
  userForm.role = u.role
  showUserForm.value = true
}

async function handleUserSubmit() {
  if (editingUser.value) {
    if (!editingUser.value) return
  } else {
    if (!userForm.email || !userForm.password) return
  }
  saving.value = true
  try {
    if (editingUser.value) {
      await adminApi.updateUser(editingUser.value.id, {
        full_name: userForm.full_name,
        role: userForm.role,
      })
    } else {
      await adminApi.createUser({
        email: userForm.email,
        password: userForm.password,
        full_name: userForm.full_name,
        role: userForm.role,
      })
    }
    showUserForm.value = false
    await loadUsers()
  } catch (e: any) {
    useToast().error(e.message)
  } finally {
    saving.value = false
  }
}

function openPasswordForm(u: UserRow) {
  passwordUser.value = u
  passwordForm.current_password = ''
  passwordForm.new_password = ''
  showPasswordForm.value = true
}

async function handlePasswordSubmit() {
  if (!passwordUser.value || !passwordForm.new_password) return
  savingPwd.value = true
  try {
    await adminApi.changePassword(passwordUser.value.id, {
      current_password: passwordForm.current_password || undefined,
      new_password: passwordForm.new_password,
    })
    showPasswordForm.value = false
    useToast().success('密码修改成功')
  } catch (e: any) {
    useToast().error(e.message)
  } finally {
    savingPwd.value = false
  }
}

async function handleDeleteUser() {
  if (!confirmDeleteUser.value) return
  try {
    await adminApi.deleteUser(confirmDeleteUser.value.id)
    await loadUsers()
  } catch (e: any) {
    useToast().error(e.message)
  }
  confirmDeleteUser.value = null
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
