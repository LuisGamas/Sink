<script setup lang="ts">
import type { CounterData, Link, LinkListResponse, LinkUpdateType } from '@/types'
import { useInfiniteScroll } from '@vueuse/core'
import { Loader, Trash2, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const linksStore = useDashboardLinksStore()

const links = ref<Link[]>([])
const listComplete = ref(false)
const listError = ref(false)
const limit = 24
let cursor = ''

const selectedSlugs = ref<Set<string>>(new Set())

function toggleSelect(slug: string) {
  if (selectedSlugs.value.has(slug)) {
    selectedSlugs.value.delete(slug)
  }
  else {
    selectedSlugs.value.add(slug)
  }
}

function clearSelection() {
  selectedSlugs.value.clear()
}

const isDeletingBatch = ref(false)
async function handleBatchDelete() {
  if (selectedSlugs.value.size === 0 || isDeletingBatch.value)
    return

  const confirmMessage = `Are you sure you want to delete ${selectedSlugs.value.size} links?`
  // eslint-disable-next-line no-alert
  if (!confirm(confirmMessage))
    return

  isDeletingBatch.value = true
  try {
    const slugs = Array.from(selectedSlugs.value)
    await useAPI('/api/link/delete-batch', {
      method: 'POST',
      body: { slugs },
    })

    // Update local list
    links.value = links.value.filter(l => !selectedSlugs.value.has(l.slug))
    selectedSlugs.value.clear()
    toast.success('Links deleted successfully')
  }
  catch (error) {
    console.error('Failed to delete links:', error)
    toast.error('Failed to delete links')
  }
  finally {
    isDeletingBatch.value = false
  }
}

const countersMap = ref<Record<string, CounterData>>({})
provide('linksCountersMap', countersMap)

const pendingIds = new Set<string>()
const defaultCounters: CounterData = Object.freeze({ visits: 0, visitors: 0, referers: 0 })

async function fetchCounters(ids: string[]) {
  if (!ids.length)
    return
  ids.forEach(id => pendingIds.add(id))
  try {
    const result = await useAPI<{ data: (CounterData & { id: string })[] }>('/api/stats/counters', {
      query: { id: ids.join(',') },
    })
    for (const item of result.data ?? []) {
      countersMap.value[item.id] = {
        visits: item.visits,
        visitors: item.visitors,
        referers: item.referers,
      }
    }
  }
  catch (error) {
    console.error('Failed to fetch counters:', error)
  }
  finally {
    for (const id of ids) {
      if (!countersMap.value[id])
        countersMap.value[id] = { ...defaultCounters }
      pendingIds.delete(id)
    }
  }
}

const scrollContainer = ref<HTMLElement | Window | null>(null)

onMounted(() => {
  scrollContainer.value = document.querySelector('.overflow-y-auto') as HTMLElement | null
})

const displayedLinks = computed(() => {
  const sorted = [...links.value]
  switch (linksStore.sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt - a.createdAt)
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt - b.createdAt)
    case 'az':
      return sorted.sort((a, b) => a.slug.localeCompare(b.slug))
    case 'za':
      return sorted.sort((a, b) => b.slug.localeCompare(a.slug))
    default:
      return sorted
  }
})

async function getLinks() {
  try {
    const data = await useAPI<LinkListResponse>('/api/link/list', {
      query: {
        limit,
        cursor,
      },
    })
    const newLinks = data.links.filter(Boolean)
    links.value = links.value.concat(newLinks)
    cursor = data.cursor
    listComplete.value = data.list_complete
    listError.value = false

    const ids = newLinks.map(l => l.id).filter(id => !countersMap.value[id] && !pendingIds.has(id))
    fetchCounters(ids)
  }
  catch (error) {
    console.error(error)
    listError.value = true
  }
}

const { isLoading } = useInfiniteScroll(
  scrollContainer as unknown as Ref<HTMLElement | null>,
  getLinks,
  {
    distance: 150,
    interval: 1000,
    canLoadMore: () => {
      return !listError.value && !listComplete.value
    },
  },
)

function updateLinkList(link: Link, type: LinkUpdateType) {
  if (type === 'edit') {
    const index = links.value.findIndex(l => l.id === link.id)
    links.value[index] = link
  }
  else if (type === 'delete') {
    const index = links.value.findIndex(l => l.id === link.id)
    links.value.splice(index, 1)
  }
  else {
    links.value.unshift(link)
    linksStore.sortBy = 'newest'
  }
}

linksStore.onLinkUpdate(({ link, type }) => {
  updateLinkList(link, type)
})
</script>

<template>
  <section
    class="
      grid grid-cols-1 gap-4
      md:grid-cols-2
      lg:grid-cols-3
    "
  >
    <DashboardLinksLink
      v-for="link in displayedLinks"
      :key="link.id"
      :link="link"
      :selected="selectedSlugs.has(link.slug)"
      @toggle-select="toggleSelect"
    />
  </section>

  <!-- Bulk Actions Bar -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="selectedSlugs.size > 0"
      class="
        fixed bottom-6 left-1/2 z-50 flex min-w-[300px] -translate-x-1/2
        items-center gap-4 rounded-full border bg-background px-6 py-3
        shadow-2xl
      "
    >
      <div class="flex items-center gap-2">
        <Badge variant="secondary" class="rounded-full px-2">
          {{ selectedSlugs.size }}
        </Badge>
        <span class="text-sm font-medium">Selected</span>
      </div>

      <div class="h-4 w-px bg-border" />

      <div class="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          class="h-8 gap-1.5 rounded-full"
          :disabled="isDeletingBatch"
          @click="handleBatchDelete"
        >
          <Loader v-if="isDeletingBatch" class="h-3.5 w-3.5 animate-spin" />
          <Trash2 v-else class="h-3.5 w-3.5" />
          Delete
        </Button>

        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-full"
          @click="clearSelection"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </Transition>
  <div
    v-if="isLoading"
    class="flex items-center justify-center"
  >
    <Loader class="animate-spin" />
  </div>
  <div
    v-if="!isLoading && listComplete"
    class="flex items-center justify-center text-sm"
  >
    {{ $t('links.no_more') }}
  </div>
  <div
    v-if="listError"
    class="flex items-center justify-center text-sm"
  >
    {{ $t('links.load_failed') }}
    <Button variant="link" @click="getLinks">
      {{ $t('common.try_again') }}
    </Button>
  </div>
</template>
