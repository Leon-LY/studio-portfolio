<template>
  <header class="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-20">
    <!-- 面包屑 + 标题 -->
    <div>
      <nav v-if="breadcrumbs.length > 0" class="flex items-center gap-1 text-sm">
        <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.to">
          <NuxtLink
            v-if="idx < breadcrumbs.length - 1"
            :to="crumb.to"
            class="text-stone-400 hover:text-stone-600 transition-colors"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span v-else class="font-semibold text-stone-800">{{ crumb.label }}</span>
          <span v-if="idx < breadcrumbs.length - 1" class="text-stone-300 mx-0.5">/</span>
        </template>
      </nav>
    </div>

    <!-- 用户菜单 -->
    <div class="flex items-center gap-4">
      <div class="relative">
        <button
          class="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors"
          @click="menuOpen = !menuOpen"
        >
          <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <Icon name="lucide:user" size="16" class="text-stone-500" />
          </div>
          <span class="hidden sm:inline font-medium">{{ userName }}</span>
        </button>

        <!-- 下拉菜单 -->
        <Transition name="fade">
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-elevation-3 border border-stone-200 py-1 z-50"
          >
            <div class="px-4 py-2 text-xs text-stone-500 border-b border-stone-100">
              {{ userEmail }}
            </div>
            <button
              class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
              @click="showChangePwd = true; menuOpen = false"
            >
              <Icon name="lucide:key" size="16" />
              修改密码
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
              @click="handleSignOut"
            >
              <Icon name="lucide:log-out" size="16" />
              退出登录
            </button>
          </div>
        </Transition>
      </div>

      <!-- 点击外部关闭 -->
      <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
    </div>
  </header>

    <!-- 修改密码 Modal -->
    <BaseModal v-model="showChangePwd" title="修改密码" content-class="w-full max-w-sm">
      <form @submit.prevent="handleChangePwd" class="space-y-4">
        <BaseInput v-model="pwdForm.current" label="当前密码" type="password" placeholder="输入当前密码" required />
        <BaseInput v-model="pwdForm.newPass" label="新密码" type="password" placeholder="至少6位" required />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showChangePwd = false">取消</BaseButton>
          <BaseButton type="submit" :loading="pwdSaving">确认修改</BaseButton>
        </div>
      </form>
    </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

defineProps({
  title: { type: String, default: '仪表盘' },
})

const { user, signOut } = useAuth()
const toast = useToast()
const route = useRoute()

const menuOpen = ref(false)
const showChangePwd = ref(false)
const pwdSaving = ref(false)
const pwdForm = reactive({ current: '', newPass: '' })

const userName = computed(() =>
  user.value?.full_name || user.value?.email?.split('@')[0] || '管理员',
)

const userEmail = computed(() => user.value?.email || '')

// Breadcrumb: last item is the page title. Peer pages (board) skip parent.
const peerPages = new Set(['board'])
const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  if (segments.length === 0) return []
  const crumbs: { label: string; to: string }[] = []
  const labelMap: Record<string, string> = {
    admin: '仪表盘', projects: '项目', board: '看板', contacts: '留言',
    payments: '回款管理', expenses: '支出管理', files: '文件管理', categories: '分类', styles: '风格',
    settings: '站点设置', users: '用户管理', manual: '操作手册',
    new: '新建项目', edit: '编辑',
  }
  let path = ''
  for (const seg of segments) {
    path += '/' + seg
    if (seg === '[id]' || seg.match(/^[0-9a-f-]{36}$/)) continue
    const label = labelMap[seg] || seg
    // If current is a peer page, remove its logical parent
    if (peerPages.has(seg) && crumbs.length > 1) {
      crumbs.pop()
    }
    crumbs.push({ label, to: path })
  }
  return crumbs.filter((c, i) => i === 0 || c.label !== crumbs[i - 1]?.label)
})

async function handleSignOut() {
  menuOpen.value = false
  await signOut()
}

async function handleChangePwd() {
  if (!pwdForm.current || !pwdForm.newPass) return
  pwdSaving.value = true
  try {
    await adminApi.changePassword(user.value.id, {
      current_password: pwdForm.current,
      new_password: pwdForm.newPass,
    })
    showChangePwd.value = false
    pwdForm.current = ''
    pwdForm.newPass = ''
    toast.success('密码修改成功')
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    pwdSaving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
