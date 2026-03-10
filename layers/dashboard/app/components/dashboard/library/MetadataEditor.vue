<script setup lang="ts">
import { cn } from '@/lib/utils'
import { LIBRARY_COLORS } from '@/utils/library'

const props = defineProps<{
  type: 'folder' | 'tag'
  item?: { name: string, color: string }
}>()

const emit = defineEmits<{
  save: [ { name: string, color: string, oldName?: string } ]
  close: []
}>()

const { t } = useI18n()

const name = ref(props.item?.name || '')
const selectedColor = ref(props.item?.color || (props.type === 'folder' ? 'slate' : 'primary'))

const fieldId = useId()

function handleSave() {
  if (!name.value)
    return

  // If renaming an existing item, ask for confirmation
  if (props.item && props.item.name !== name.value) {
    // eslint-disable-next-line no-alert
    if (!confirm(t('dashboard.library.rename_confirm', { old: props.item.name, new: name.value }))) {
      return
    }
  }

  emit('save', {
    name: name.value,
    color: selectedColor.value,
    oldName: props.item?.name,
  })
}
</script>

<template>
  <div class="space-y-6 py-4">
    <div class="space-y-2">
      <Label :for="fieldId">{{ $t('dashboard.name') }}</Label>
      <Input
        :id="fieldId"
        v-model="name"
        :placeholder="type === 'folder' ? 'Marketing' : 'promo'"
        @keydown.enter="handleSave"
      />
      <p v-if="item" class="text-[10px] text-muted-foreground italic">
        {{ $t('dashboard.library.rename_tip', { type: type === 'folder' ? $t('nav.folders').slice(0, -1).toLowerCase() : $t('nav.tags').slice(0, -1).toLowerCase() }) }}
      </p>
    </div>

    <div class="space-y-3">
      <Label>{{ $t('links.change_qr_color') }}</Label>
      <div
        class="
          grid grid-cols-5 gap-3
          sm:grid-cols-10
        "
      >
        <button
          v-for="color in LIBRARY_COLORS"
          :key="color.name"
          type="button"
          :class="cn(
            `
              size-7 rounded-full border-2 shadow-sm transition-all
              hover:scale-110
            `,
            color.class,
            selectedColor === color.name ? `
              border-foreground ring-2 ring-ring ring-offset-2
            ` : `border-transparent`,
          )"
          :title="color.name"
          @click="selectedColor = color.name"
        />
      </div>
    </div>

    <div class="flex justify-end gap-3 border-t pt-4">
      <Button variant="outline" @click="emit('close')">
        {{ $t('common.cancel') }}
      </Button>
      <Button :disabled="!name" @click="handleSave">
        {{ $t('common.save') }}
      </Button>
    </div>
  </div>
</template>
