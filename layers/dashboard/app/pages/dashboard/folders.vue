<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'dashboard',
})

const { data: metadata, refresh } = await useAsyncData('metadata', () => useAPI<{ folders: any[], tags: any[] }>('/api/metadata'))

const showEditor = ref(false)
const editingItem = ref<any>(null)

function openCreate() {
  editingItem.value = null
  showEditor.value = true
}

function openEdit(item: any) {
  editingItem.value = item
  showEditor.value = true
}

async function handleSave(data: { name: string, color: string, oldName?: string }) {
  try {
    await useAPI('/api/metadata/update', {
      method: 'POST',
      body: {
        type: 'folder',
        ...data,
      },
    })
    toast.success(t('dashboard.library.update_success', { type: t('nav.folders').slice(0, -1) }))
    showEditor.value = false
    refresh()
  }
  catch {
    toast.error(t('dashboard.library.update_failed', { type: t('nav.folders').slice(0, -1) }))
  }
}

async function handleDelete(name: string) {
  // eslint-disable-next-line no-alert
  if (!confirm(t('dashboard.library.delete_confirm', { type: t('nav.folders').slice(0, -1).toLowerCase(), name })))
    return

  try {
    await useAPI('/api/metadata/delete', {
      method: 'POST',
      body: {
        type: 'folder',
        name,
      },
    })
    toast.success(t('dashboard.library.delete_success', { type: t('nav.folders').slice(0, -1) }))
    refresh()
  }
  catch {
    toast.error(t('dashboard.library.delete_failed', { type: t('nav.folders').slice(0, -1) }))
  }
}
</script>

<template>
  <main class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ $t('dashboard.library.folders_title') }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ $t('dashboard.library.folders_subtitle') }}
        </p>
      </div>
      <Button @click="openCreate">
        <Plus class="mr-2 size-4" />
        {{ $t('dashboard.library.create_folder') }}
      </Button>
    </div>

    <DashboardLibraryTable
      :title="$t('dashboard.library.folders_title')"
      :items="metadata?.folders || []"
      type="folder"
      @edit="openEdit"
      @delete="handleDelete"
    />

    <ResponsiveModal
      v-model:open="showEditor"
      :title="editingItem ? `${$t('common.edit')} ${editingItem.name}` : $t('dashboard.library.create_folder')"
    >
      <DashboardLibraryMetadataEditor
        type="folder"
        :item="editingItem"
        @save="handleSave"
        @close="showEditor = false"
      />
    </ResponsiveModal>
  </main>
</template>
