<script setup lang="ts">
import { Eye, LayoutGrid, List, Scissors, StretchHorizontal } from 'lucide-vue-next'

const linksStore = useDashboardLinksStore()
const { t } = useI18n()
</script>

<template>
  <div
    class="
      flex items-center space-x-1 rounded-md border bg-background p-1 shadow-sm
    "
  >
    <!-- View Mode Toggle -->
    <div class="mr-1 flex items-center space-x-1 border-r pr-1">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :class="{ 'bg-accent text-accent-foreground': linksStore.viewMode === 'grid' }"
        :title="t('links.view.grid')"
        @click="linksStore.viewMode = 'grid'"
      >
        <LayoutGrid class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :class="{ 'bg-accent text-accent-foreground': linksStore.viewMode === 'minimal' }"
        :title="t('links.view.minimal')"
        @click="linksStore.viewMode = 'minimal'"
      >
        <StretchHorizontal class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :class="{ 'bg-accent text-accent-foreground': linksStore.viewMode === 'list' }"
        :title="t('links.view.list')"
        @click="linksStore.viewMode = 'list'"
      >
        <List class="h-4 w-4" />
      </Button>
    </div>

    <!-- URL Mode Toggle -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8"
      :class="{ 'bg-accent text-accent-foreground': linksStore.shortUrlMode === 'compact' }"
      :title="linksStore.shortUrlMode === 'full' ? t('links.view.compact_url') : t('links.view.full_url')"
      @click="linksStore.shortUrlMode = linksStore.shortUrlMode === 'full' ? 'compact' : 'full'"
    >
      <Scissors v-if="linksStore.shortUrlMode === 'full'" class="h-4 w-4" />
      <Eye v-else class="h-4 w-4" />
    </Button>
  </div>
</template>
