<script setup lang="ts">
import { ChevronRight, Folder, Tag } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { getFolderColor, getTagColor } from '@/utils/color'

defineProps<{
  folders: string[]
  tags: string[]
}>()

const route = useRoute()
</script>

<template>
  <SidebarGroup v-if="folders.length">
    <SidebarGroupLabel>{{ $t('links.form.folder') }}s</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible as-child class="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="`${$t('links.form.folder')}s`">
              <Folder />
              <span>{{ $t('links.form.folder') }}s</span>
              <ChevronRight
                class="
                  ml-auto transition-transform duration-200
                  group-data-[state=open]/collapsible:rotate-90
                "
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="folder in folders" :key="folder">
                <SidebarMenuSubButton as-child :data-active="route.query.folder === folder">
                  <NuxtLink :to="{ path: '/dashboard/links', query: { folder } }">
                    <div :class="cn('mr-2 size-2 rounded-full border', getFolderColor(folder))" />
                    <span>{{ folder }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>

  <SidebarGroup v-if="tags.length">
    <SidebarGroupLabel>{{ $t('links.form.tags') }}</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible as-child class="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="$t('links.form.tags')">
              <Tag />
              <span>{{ $t('links.form.tags') }}</span>
              <ChevronRight
                class="
                  ml-auto transition-transform duration-200
                  group-data-[state=open]/collapsible:rotate-90
                "
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="tag in tags" :key="tag">
                <SidebarMenuSubButton as-child :data-active="route.query.tag === tag">
                  <NuxtLink :to="{ path: '/dashboard/links', query: { tag } }">
                    <div :class="cn('mr-2 size-2 rounded-full border', getTagColor(tag))" />
                    <span>{{ tag }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
