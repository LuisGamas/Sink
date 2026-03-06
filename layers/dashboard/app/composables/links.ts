import type { Link, LinkUpdateType } from '@/types'
import { defineStore } from '#imports'
import { createEventHook, tryOnScopeDispose } from '@vueuse/core'
import { ref } from 'vue'

export interface LinkUpdateEvent {
  link: Link
  type: LinkUpdateType
}

export const useDashboardLinksStore = defineStore('dashboard-links', () => {
  const sortBy = ref<'newest' | 'oldest' | 'az' | 'za'>('az')

  const showLinkEditor = ref(false)
  const editingLink = ref<Record<string, unknown> | null>(null)

  // Bulk selection state
  const selectedSlugs = ref<string[]>([])

  function toggleSelect(slug: string) {
    const index = selectedSlugs.value.indexOf(slug)
    if (index > -1) {
      selectedSlugs.value = selectedSlugs.value.filter(s => s !== slug)
    }
    else {
      selectedSlugs.value = [...selectedSlugs.value, slug]
    }
  }

  function clearSelection() {
    selectedSlugs.value = []
  }

  const linkUpdateHook = createEventHook<LinkUpdateEvent>()

  function openLinkEditor(link?: Record<string, unknown>) {
    editingLink.value = link || null
    showLinkEditor.value = true
  }

  function closeLinkEditor() {
    showLinkEditor.value = false
    editingLink.value = null
  }

  function notifyLinkUpdate(link: Link, type: LinkUpdateType) {
    linkUpdateHook.trigger({ link, type })
  }

  function onLinkUpdate(callback: (event: LinkUpdateEvent) => void) {
    const { off } = linkUpdateHook.on(callback)
    tryOnScopeDispose(off)
    return off
  }

  return {
    sortBy,
    showLinkEditor,
    editingLink,
    selectedSlugs,
    toggleSelect,
    clearSelection,
    openLinkEditor,
    closeLinkEditor,
    notifyLinkUpdate,
    onLinkUpdate,
  }
})
