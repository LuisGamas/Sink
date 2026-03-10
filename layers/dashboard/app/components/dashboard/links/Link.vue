<script setup lang="ts">
import type { CounterData, Link } from '@/types'
import { useClipboard, useNow } from '@vueuse/core'
import { CalendarPlus2, Check, Clock, Copy, CopyCheck, Eraser, Folder, Hourglass, MousePointerClick, QrCode, ShieldAlert, SquareChevronDown, SquarePen, Tag, Users } from 'lucide-vue-next'
import { parseURL } from 'ufo'
import { toast } from 'vue-sonner'

import { cn } from '@/lib/utils'
import { getLibraryColorClasses } from '@/utils/library'

const props = defineProps<{
  link: Link & { folderColor?: string, tagsWithColors?: { name: string, color: string }[] }
  selected?: boolean
}>()

const emit = defineEmits<{
  toggleSelect: [slug: string]
}>()

// Helper to get color classes based on the stored color name
function getColorClasses(colorName?: string) {
  return getLibraryColorClasses(colorName)
}

const { t } = useI18n()
const editPopoverOpen = ref(false)

const countersMap = inject<Ref<Record<string, CounterData>> | undefined>('linksCountersMap', undefined)
const counters = computed(() => countersMap?.value?.[props.link.id])

const requestUrl = useRequestURL()
const host = requestUrl.host
const origin = requestUrl.origin

function getLinkHost(url: string): string | undefined {
  const { host } = parseURL(url)
  return host
}

const shortLink = computed(() => `${origin}/${props.link.slug}`)
const linkIcon = computed(() => `https://unavatar.webp.se/${getLinkHost(props.link.url)}?fallback=https://sink.cool/icon.png`)

const { copy, copied } = useClipboard({ source: shortLink.value, copiedDuring: 400 })

function copyLink() {
  copy(shortLink.value)
  toast(t('links.copy_success'))
}

const now = useNow()
const isScheduled = computed(() => props.link.startsAt && props.link.startsAt * 1000 > now.value.getTime())
const isExpired = computed(() => props.link.expiration && props.link.expiration * 1000 < now.value.getTime())

const linksStore = useDashboardLinksStore()
const displayHost = computed(() => linksStore.shortUrlMode === 'compact' ? '...' : host)
</script>

<template>
  <Card
    :class="cn(
      'group/card relative transition-colors duration-200',
      selected && 'border-primary bg-primary/5 ring-1 ring-primary/20',
      linksStore.viewMode === 'list' ? 'h-auto py-1' : 'h-full',
    )"
  >
    <!-- Selection Control -->
    <div
      class="absolute top-2 left-2 z-30 transition-all duration-200"
      :class="[selected ? 'opacity-100' : `
        opacity-0
        group-hover/card:opacity-100
      `]"
      @click.stop.prevent="emit('toggleSelect', link.slug)"
    >
      <div
        class="
          flex size-5 cursor-pointer items-center justify-center rounded border
          shadow-sm transition-colors
        "
        :class="selected ? 'border-primary bg-primary text-primary-foreground' : `
          border-muted-foreground/30 bg-background
          hover:border-primary
        `"
      >
        <Check v-if="selected" class="size-3.5 stroke-[3px]" />
      </div>
    </div>

    <CardContent
      :class="cn('flex-1 p-4', linksStore.viewMode === 'list' && `px-4 py-1`)"
    >
      <!-- LIST VIEW -->
      <div
        v-if="linksStore.viewMode === 'list'" class="
          flex items-center space-x-4
        "
      >
        <Avatar class="h-8 w-8 shrink-0">
          <AvatarImage :src="linkIcon" :alt="link.slug" />
          <AvatarFallback><img src="/icon.png" class="h-8 w-8"></AvatarFallback>
        </Avatar>

        <div class="flex min-w-0 flex-1 items-center space-x-3">
          <div class="shrink-0 truncate font-bold">
            {{ displayHost }}/{{ link.slug }}
          </div>
          <div class="flex shrink-0 items-center space-x-1">
            <Badge v-if="link.unsafe" variant="destructive" class="px-1 py-0">
              <ShieldAlert
                class="h-3 w-3"
              />
            </Badge>
            <Badge
              v-if="isScheduled" variant="outline" class="
                border-yellow-500 px-1 py-0 text-yellow-500
              "
            >
              <Clock
                class="h-3 w-3"
              />
            </Badge>
            <Badge v-if="isExpired" variant="destructive" class="px-1 py-0">
              <Hourglass
                class="h-3 w-3"
              />
            </Badge>
          </div>
          <div
            v-if="link.folder" :class="cn(`
              hidden max-w-[100px] truncate rounded border border-transparent
              px-1.5 py-0 text-[10px]
              md:block
            `, getColorClasses(link.folderColor))"
          >
            {{ link.folder }}
          </div>
        </div>

        <div
          class="
            hidden shrink-0 items-center space-x-4 text-xs text-muted-foreground
            lg:flex
          "
        >
          <template v-if="counters">
            <span class="flex items-center"><MousePointerClick
              class="mr-1 h-3 w-3"
            /> {{ counters.visits }}</span>
            <span class="flex items-center"><Users class="mr-1 h-3 w-3" /> {{ counters.visitors }}</span>
          </template>
          <span>{{ shortDate(link.createdAt) }}</span>
        </div>

        <div class="flex shrink-0 items-center space-x-1">
          <Button variant="ghost" size="icon" class="h-8 w-8" @click.prevent="copyLink">
            <CopyCheck v-if="copied" class="h-4 w-4" />
            <Copy v-else class="h-4 w-4" />
          </Button>
          <Popover v-model:open="editPopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="ghost" size="icon" class="h-8 w-8"
              >
                <SquareChevronDown
                  class="h-4 w-4"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="end">
              <DashboardLinksEditor :link="link">
                <div
                  class="
                    flex cursor-pointer items-center rounded-sm px-2 py-1.5
                    text-sm
                    hover:bg-accent
                  "
                >
                  <SquarePen
                    class="mr-2 h-4 w-4"
                  /> {{ $t('common.edit') }}
                </div>
              </DashboardLinksEditor>
              <Separator />
              <DashboardLinksDelete :link="link">
                <div
                  class="
                    flex cursor-pointer items-center rounded-sm px-2 py-1.5
                    text-sm text-destructive
                    hover:bg-accent
                  "
                >
                  <Eraser
                    class="mr-2 h-4 w-4"
                  /> {{ $t('common.delete') }}
                </div>
              </DashboardLinksDelete>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <!-- GRID / MINIMAL VIEW -->
      <NuxtLink
        v-else
        class="flex h-full flex-col"
        :class="linksStore.viewMode === 'minimal' ? 'space-y-2' : 'space-y-3'"
        :to="`/dashboard/link?slug=${link.slug}`"
      >
        <div class="flex items-center justify-center space-x-3">
          <Avatar :class="linksStore.viewMode === 'minimal' ? 'h-8 w-8' : ''">
            <AvatarImage :src="linkIcon" :alt="link.slug" loading="lazy" />
            <AvatarFallback><img src="/icon.png" :alt="link.slug" loading="lazy"></AvatarFallback>
          </Avatar>

          <div class="flex-1 overflow-hidden">
            <div class="flex items-center">
              <div class="truncate leading-5 font-bold">
                {{ displayHost }}/{{ link.slug }}
              </div>
              <div class="ml-1 flex shrink-0 items-center space-x-0.5">
                <Badge
                  v-if="link.unsafe" variant="destructive" class="px-1 py-0"
                >
                  <ShieldAlert
                    class="h-3 w-3"
                  />
                </Badge>
                <Badge
                  v-if="isScheduled" variant="outline" class="
                    border-yellow-500 px-1 py-0 text-yellow-500
                  "
                >
                  <Clock
                    class="h-3 w-3"
                  />
                </Badge>
                <Badge v-if="isExpired" variant="destructive" class="px-1 py-0">
                  <Hourglass
                    class="h-3 w-3"
                  />
                </Badge>
              </div>

              <Button
                variant="ghost" size="icon" class="ml-auto h-6 w-6 p-0"
                @click.prevent="copyLink"
              >
                <CopyCheck v-if="copied" class="h-3.5 w-3.5" />
                <Copy v-else class="h-3.5 w-3.5" />
              </Button>
            </div>

            <p
              v-if="linksStore.viewMode !== 'minimal'" class="
                mt-0.5 truncate text-sm text-muted-foreground
              "
            >
              {{ link.comment || link.title || link.description || link.url }}
            </p>
          </div>

          <div class="flex shrink-0 items-center space-x-1">
            <Popover>
              <PopoverTrigger aria-label="Show QR code">
                <QrCode
                  class="
                    h-4 w-4 opacity-70 transition-opacity
                    hover:opacity-100
                  " @click.prevent
                />
              </PopoverTrigger>
              <PopoverContent><DashboardLinksQRCode :data="shortLink" :image="linkIcon" /></PopoverContent>
            </Popover>

            <Popover v-model:open="editPopoverOpen">
              <PopoverTrigger aria-label="More actions">
                <SquareChevronDown
                  class="
                    h-4 w-4 opacity-70 transition-opacity
                    hover:opacity-100
                  " @click.prevent
                />
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" :hide-when-detached="false">
                <DashboardLinksEditor :link="link">
                  <div
                    class="
                      flex cursor-pointer items-center rounded-sm px-2 py-1.5
                      text-sm
                      hover:bg-accent
                    "
                  >
                    <SquarePen
                      aria-hidden="true" class="mr-2 h-4 w-4"
                    /> {{ $t('common.edit') }}
                  </div>
                </DashboardLinksEditor>
                <Separator />
                <DashboardLinksDelete :link="link">
                  <div
                    class="
                      flex cursor-pointer items-center rounded-sm px-2 py-1.5
                      text-sm text-destructive
                      hover:bg-accent
                    "
                  >
                    <Eraser
                      aria-hidden="true" class="mr-2 h-4 w-4"
                    /> {{ $t('common.delete') }}
                  </div>
                </DashboardLinksDelete>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div class="mt-auto flex flex-col space-y-2">
          <div
            v-if="linksStore.viewMode !== 'minimal'" class="
              flex h-5 w-full items-center space-x-2 text-xs
              text-muted-foreground
            "
          >
            <CalendarPlus2 class="h-3 w-3" /> <span>{{ shortDate(link.createdAt) }}</span>
            <template v-if="link.expiration">
              <Separator orientation="vertical" class="h-3" />
              <Hourglass class="h-3 w-3" :class="{ 'text-destructive': isExpired }" /> <span>{{ shortDate(link.expiration) }}</span>
            </template>
            <Separator orientation="vertical" class="h-3" />
            <span class="flex-1 truncate">{{ link.url }}</span>
          </div>

          <div
            v-if="link.folder || link.tags?.length" class="flex flex-wrap gap-1"
          >
            <Badge
              v-if="link.folder" variant="outline" :class="cn(`
                border-transparent px-1 py-0 text-[10px] font-normal
              `, getColorClasses(link.folderColor))"
            >
              <Folder class="mr-1 h-3 w-3" /> {{ link.folder }}
            </Badge>
            <Badge
              v-for="tag in link.tagsWithColors" :key="tag.name" variant="secondary" :class="cn(`
                border-transparent px-1 py-0 text-[10px] font-normal
              `, getColorClasses(tag.color))"
            >
              <Tag class="mr-1 h-3 w-3" /> {{ tag.name }}
            </Badge>
          </div>

          <div v-if="countersMap" class="flex h-5 w-full space-x-2 text-sm">
            <template v-if="counters">
              <Badge variant="secondary" class="h-5 px-1.5 text-[10px]">
                <MousePointerClick
                  class="mr-1 h-3 w-3"
                /> {{ counters.visits }}
              </Badge>
              <Badge variant="secondary" class="h-5 px-1.5 text-[10px]">
                <Users
                  class="mr-1 h-3 w-3"
                /> {{ counters.visitors }}
              </Badge>
            </template>
            <template v-else>
              <Skeleton
                class="h-5 w-full rounded-full bg-secondary"
              />
            </template>
          </div>
        </div>
      </NuxtLink>
    </CardContent>
  </Card>
</template>
