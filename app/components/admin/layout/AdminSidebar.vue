<template>
  <aside
    class="bg-stone-900 text-canvas flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 lg:translate-x-0 lg:z-30"
    :class="[open ? 'translate-x-0' : '-translate-x-full', collapsed ? 'w-16' : 'w-64']"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between h-14 px-4 lg:h-16 border-b border-stone-700" :class="collapsed ? 'lg:justify-center lg:px-0' : 'lg:px-6'">
      <NuxtLink v-if="!collapsed" to="/admin" class="font-serif text-lg font-bold tracking-tight" @click="$emit('close')">方外设计 后台</NuxtLink>
      <NuxtLink v-else to="/admin" class="font-serif text-lg font-bold tracking-tight" title="仪表盘" @click="$emit('close')">方</NuxtLink>
      <button
        class="p-1 -mr-1 rounded-sm hover:bg-stone-700 transition-colors lg:hidden"
        aria-label="关闭菜单"
        @click="$emit('close')"
      >
        <Icon name="lucide:x" size="20" />
      </button>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 py-6 overflow-y-auto" :class="collapsed ? 'px-2 space-y-4' : 'px-4 space-y-5'">
      <template v-for="group in navGroups" :key="group.label">
        <div>
          <p v-if="!collapsed" class="px-3 mb-2 text-[10px] font-medium text-stone-500 uppercase tracking-widest">{{ group.label }}</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :title="collapsed ? item.label : ''"
              class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors"
              :class="[isActive(item.to) ? 'bg-stone-700 text-canvas border-l-2 border-accent-400' : 'text-stone-400 hover:text-canvas hover:bg-stone-800', collapsed ? 'justify-center px-0' : '']"
              @click="$emit('close')"
            >
              <Icon :name="item.icon" size="18" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </template>
    </nav>

    <!-- 底部操作 -->
    <div class="border-t border-stone-700" :class="collapsed ? 'p-2' : 'p-4'">
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-canvas transition-colors rounded-sm hover:bg-stone-800"
        :class="collapsed ? 'justify-center px-0' : ''"
        :title="collapsed ? '展开菜单' : '收起菜单'"
        @click="$emit('toggle')"
      >
        <Icon :name="collapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'" size="16" />
        <span v-if="!collapsed">收起菜单</span>
      </button>
      <NuxtLink
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-canvas transition-colors rounded-sm hover:bg-stone-800 mt-1"
        :class="collapsed ? 'justify-center px-0' : ''"
        :title="collapsed ? '查看网站' : ''"
      >
        <Icon name="lucide:external-link" size="16" />
        <span v-if="!collapsed">查看网站</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps({
  open: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
})

defineEmits(['close', 'toggle'])

const route = useRoute()

const navGroups = [
  {
    label: '内容管理',
    items: [
      { to: '/admin', label: '仪表盘', icon: 'lucide:layout-dashboard' },
      { to: '/admin/projects', label: '项目', icon: 'lucide:folder-kanban' },
      { to: '/admin/projects/board', label: '看板', icon: 'lucide:kanban' },
      { to: '/admin/clients', label: '客户', icon: 'lucide:users' },
      { to: '/admin/contacts', label: '留言', icon: 'lucide:inbox' },
    ],
  },
  {
    label: '财务管理',
    items: [
      { to: '/admin/finance', label: '收支总览', icon: 'lucide:bar-chart-3' },
      { to: '/admin/payments', label: '回款管理', icon: 'lucide:receipt' },
      { to: '/admin/expenses', label: '支出管理', icon: 'lucide:banknote' },
      { to: '/admin/files', label: '文件管理', icon: 'lucide:folder-open' },
      { to: '/admin/categories', label: '分类', icon: 'lucide:folder-tree' },
      { to: '/admin/styles', label: '风格', icon: 'lucide:palette' },
    ],
  },
  {
    label: '系统设置',
    items: [
      { to: '/admin/settings', label: '站点设置', icon: 'lucide:settings' },
      { to: '/admin/users', label: '用户管理', icon: 'lucide:users' },
      { to: '/admin/manual', label: '操作手册', icon: 'lucide:book-open' },
    ],
  },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  if (path === '/admin/projects') return route.path.startsWith('/admin/projects') && route.path !== '/admin/projects/board'
  return route.path.startsWith(path)
}
</script>
