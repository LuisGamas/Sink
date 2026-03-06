<script setup lang="ts">
import { Loader, Trash2, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'dashboard',
})

const linksStore = useDashboardLinksStore()
const isDeleting = ref(false)

async function handleBatchDelete() {
  const count = linksStore.selectedSlugs.length
  if (count === 0 || isDeleting.value)
    return

  // eslint-disable-next-line no-alert
  if (!confirm(`Are you sure you want to delete ${count} selected links?`))
    return

  isDeleting.value = true
  try {
    const slugs = [...linksStore.selectedSlugs]
    await useAPI('/api/link/delete-batch', {
      method: 'POST',
      body: { slugs },
    })

    linksStore.notifyLinkUpdate({ slugs } as any, 'delete-batch')
    linksStore.clearSelection()
    toast.success(`${count} links deleted successfully`)
  }
  catch (error) {
    console.error('Failed to delete links:', error)
    toast.error('Failed to delete links')
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <main class="space-y-6">
    <Teleport to="#dashboard-header-actions" defer>
      <DashboardLinksEditor />
      <div
        class="
          flex-1
          sm:hidden
        "
      />
      <DashboardLinksSort />
      <DashboardLinksSearch
        class="max-sm:w-full"
      />
    </Teleport>

    <DashboardLinks />

    <!-- Floating Bulk Actions Bar -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-20 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-20 opacity-0"
      >
        <div
          v-if="linksStore.selectedSlugs.length > 0"
          class="
            fixed bottom-8 left-1/2 z-[9999] flex min-w-[300px] -translate-x-1/2
            items-center gap-4 rounded-lg border bg-background px-4 py-2.5
            shadow-2xl
          "
        >
          <div class="flex items-center gap-2 px-2">
            <Badge
              variant="secondary" class="
                h-6 min-w-[24px] justify-center font-bold
              "
            >
              {{ linksStore.selectedSlugs.length }}
            </Badge>
            <span class="text-sm font-medium">Links selected</span>
          </div>

          <Separator orientation="vertical" class="h-6" />

          <div class="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              class="h-8 gap-2 font-medium"
              :disabled="isDeleting"
              @click="handleBatchDelete"
            >
              <Loader v-if="isDeleting" class="h-3.5 w-3.5 animate-spin" />
              <Trash2 v-else class="h-3.5 w-3.5" />
              Delete
            </Button>

            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              @click="linksStore.clearSelection"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
