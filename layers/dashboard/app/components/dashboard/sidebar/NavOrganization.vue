<script setup lang="ts">
import { Folder, Tag } from 'lucide-vue-next'

const route = useRoute()

const items = computed(() => [
  {
    title: 'nav.folders',
    url: '/dashboard/folders',
    icon: Folder,
    isActive: route.path === '/dashboard/folders',
  },
  {
    title: 'nav.tags',
    url: '/dashboard/tags',
    icon: Tag,
    isActive: route.path === '/dashboard/tags',
  },
])
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ $t('nav.library') }}</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in items" :key="item.title">
        <SidebarMenuButton
          as-child
          :is-active="item.isActive"
          :tooltip="$t(item.title)"
        >
          <NuxtLink :to="item.url">
            <component :is="item.icon" />
            <span>{{ $t(item.title) }}</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
