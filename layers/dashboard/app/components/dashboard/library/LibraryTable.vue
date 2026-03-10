<script setup lang="ts">
import { MoreHorizontal, Search } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { getLibraryColorClasses } from '@/utils/library'

interface Item {
  name: string
  count: number
  color: string
}

const props = defineProps<{
  title: string
  items: Item[]
  type: 'folder' | 'tag'
}>()

const emit = defineEmits<{
  edit: [Item]
  delete: [string]
}>()

const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value)
    return props.items
  return props.items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="relative w-full max-w-sm items-center">
        <Input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="pl-10"
        />
        <span
          class="
            absolute inset-y-0 left-0 flex items-center justify-center pl-3
          "
        >
          <Search class="size-4 text-muted-foreground" />
        </span>
      </div>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ title }}</TableHead>
            <TableHead class="text-right">
              {{ $t('dashboard.count') }}
            </TableHead>
            <TableHead class="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in filteredItems" :key="item.name">
            <TableCell>
              <div class="flex items-center gap-3">
                <div :class="cn('size-3 rounded-full border', getLibraryColorClasses(item.color))" />
                <span class="font-medium">{{ item.name }}</span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <Badge variant="secondary" class="font-mono">
                <NuxtLink
                  :to="{ path: '/dashboard/links', query: { [type]: item.name } }" class="
                    hover:underline
                  "
                >
                  {{ item.count }} {{ $t('nav.links').toLowerCase() }}
                </NuxtLink>
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="size-8">
                    <MoreHorizontal class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="emit('edit', item)">
                    {{ $t('common.edit') }}
                  </DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive" @click="emit('delete', item.name)">
                    {{ $t('common.delete') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="filteredItems.length === 0">
            <TableCell
              colspan="3" class="h-24 text-center text-muted-foreground"
            >
              {{ $t('dashboard.no_data') }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <div class="px-1 text-xs text-muted-foreground">
      {{ $t('dashboard.library.viewing', { current: filteredItems.length, total: items.length, type: title.toLowerCase() }) }}
    </div>
  </div>
</template>
