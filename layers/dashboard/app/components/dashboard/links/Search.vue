<script setup lang="ts">
import type { Link } from '@/types'
import { createReusableTemplate, useClipboard, useMagicKeys, useMediaQuery } from '@vueuse/core'
import { Copy, LinkIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

defineOptions({
  inheritAttrs: false,
})
const [TriggerTemplate, TriggerComponent] = createReusableTemplate()
const [SearchTemplate, SearchComponent] = createReusableTemplate()

const isDesktop = useMediaQuery('(min-width: 640px)')
const { copy } = useClipboard()

const router = useRouter()

const isOpen = ref(false)
const searchTerm = ref('')
const links = ref<Link[]>([])
const isLoading = ref(false)

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})

function sanitizeSlotAttrs(attrs?: Record<string, unknown>) {
  if (!attrs)
    return {}

  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !key.startsWith('$')),
  ) as Record<string, unknown>
}

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    isOpen.value = true
})

function selectLink(link: Link | undefined) {
  if (!link)
    return
  isOpen.value = false
  router.push({
    path: '/dashboard/link',
    query: { slug: link.slug },
  })
}

async function handleCopy(e: Event, slug: string) {
  e.stopPropagation()
  const shortLink = buildShortLink(window.location.origin, slug)
  await copy(shortLink)
  toast.success('Copied to clipboard', {
    description: shortLink,
  })
}

function buildShortLink(origin: string, slug: string) {
  return `${origin}/${slug}`
}

async function getLinks(val: string) {
  if (isLoading.value)
    return
  isLoading.value = true
  try {
    // Optimized: Use the new paginated search API
    const res = await useAPI<{ links: Link[] }>('/api/link/search', {
      query: { query: val, limit: 20 },
    })
    links.value = res.links
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isLoading.value = false
  }
}

// Debounce search to avoid too many API calls
watch(searchTerm, (val) => {
  getLinks(val)
}, { immediate: true })
</script>

<template>
  <TriggerTemplate v-slot="attrs">
    <Button
      v-bind="sanitizeSlotAttrs(attrs)"
      variant="outline"
      size="sm"
      class="
        relative h-9 w-full justify-start bg-background text-muted-foreground
        sm:w-32
        md:w-48
      "
    >
      <span
        class="
          hidden
          md:inline-flex
        "
      >{{ $t('links.search_placeholder') }}</span>
      <span
        class="
          inline-flex
          md:hidden
        "
      >{{ $t('common.search') }}</span>
      <kbd
        class="
          pointer-events-none absolute top-2 right-[0.3rem] hidden h-5
          items-center gap-1 rounded border bg-muted px-1.5 font-mono
          text-[10px] font-medium opacity-100 select-none
          sm:flex
        "
      >
        <span class="text-xs">⌘</span>K
      </kbd>
    </Button>
  </TriggerTemplate>
  <SearchTemplate>
    <Command class="h-auto" :should-filter="false">
      <CommandInput v-model="searchTerm" :placeholder="$t('links.search_placeholder')" autocomplete="off" />
    </Command>
    <!-- disable command search -->
    <Command class="flex-1" :should-filter="false">
      <CommandList
        class="
          max-h-none
          sm:max-h-[300px]
        "
      >
        <CommandEmpty v-if="!isLoading">
          {{ $t('links.no_results') }}
        </CommandEmpty>
        <div
          v-if="isLoading" class="
            flex items-center justify-center py-6 text-sm text-muted-foreground
          "
        >
          {{ $t('common.loading') }}...
        </div>
        <CommandGroup v-if="links.length" :heading="$t('links.group_title')">
          <CommandItem
            v-for="link in links" :key="link.slug" class="
              group flex cursor-pointer items-center justify-between py-2
            " :value="link.slug" @select="selectLink(link)"
          >
            <div class="flex flex-1 items-center gap-3 overflow-hidden">
              <div
                class="
                  flex size-8 shrink-0 items-center justify-center rounded-md
                  border bg-muted/50 text-muted-foreground
                "
              >
                <LinkIcon class="size-4" />
              </div>
              <div class="flex flex-1 flex-col overflow-hidden">
                <div class="flex items-center gap-2">
                  <span class="truncate text-sm leading-none font-semibold">
                    {{ link.slug }}
                  </span>
                  <Badge
                    v-if="link.comment" variant="outline" class="
                      h-4 px-1 text-[10px] font-normal
                    "
                  >
                    {{ link.comment }}
                  </Badge>
                </div>
                <div class="mt-0.5 truncate text-xs text-muted-foreground">
                  {{ link.url }}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              class="
                size-8 opacity-0 transition-opacity
                group-hover:opacity-100
                hover:bg-primary/10 hover:text-primary
              "
              @click="handleCopy($event, link.slug)"
            >
              <Copy class="size-3.5" />
            </Button>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </SearchTemplate>
  <Dialog v-if="isDesktop" v-model:open="isOpen">
    <DialogTrigger as-child>
      <TriggerComponent />
    </DialogTrigger>
    <DialogContent class="gap-0 overflow-hidden p-0 shadow-lg" :show-close-button="false">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ $t('links.search_placeholder') }}</DialogTitle>
      </DialogHeader>
      <SearchComponent />
    </DialogContent>
  </Dialog>
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <TriggerComponent />
    </DrawerTrigger>
    <DrawerContent class="h-[500px] gap-0">
      <DrawerHeader class="sr-only">
        <DrawerTitle>{{ $t('links.search_placeholder') }}</DrawerTitle>
      </DrawerHeader>
      <SearchComponent />
    </DrawerContent>
  </Drawer>
</template>
