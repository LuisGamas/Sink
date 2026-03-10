<script setup lang="ts">
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { getLibraryColorClasses } from '@/utils/library'

const props = defineProps<{
  options: { name: string, color: string }[]
  modelValue: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string[]]
}>()

const open = ref(false)

function toggleOption(name: string) {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(name)
  if (index > -1) {
    newValue.splice(index, 1)
  }
  else {
    newValue.push(name)
  }
  emit('update:modelValue', newValue)
}

function removeOption(name: string) {
  emit('update:modelValue', props.modelValue.filter(v => v !== name))
}

const selectedOptions = computed(() =>
  props.options.filter(opt => props.modelValue.includes(opt.name)),
)
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="
          h-auto min-h-10 w-full justify-between px-3 py-2
          hover:bg-background
        "
      >
        <div class="flex flex-wrap gap-1">
          <template v-if="selectedOptions.length > 0">
            <Badge
              v-for="opt in selectedOptions"
              :key="opt.name"
              variant="secondary"
              class="flex items-center gap-1 px-1 font-normal"
              @click.stop="removeOption(opt.name)"
            >
              <div :class="cn('size-2 rounded-full border', getLibraryColorClasses(opt.color))" />
              {{ opt.name }}
              <X
                class="
                  ml-1 size-3 opacity-50
                  hover:opacity-100
                "
              />
            </Badge>
          </template>
          <span v-else class="text-muted-foreground">{{ placeholder || $t('dashboard.library.select_items') }}</span>
        </div>
        <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[--reka-popover-trigger-width] p-0" align="start">
      <Command>
        <CommandInput :placeholder="placeholder || $t('common.search')" />
        <CommandEmpty>{{ $t('dashboard.library.no_results') }}</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="opt in options"
              :key="opt.name"
              :value="opt.name"
              @select="toggleOption(opt.name)"
            >
              <Check
                :class="cn(
                  'mr-2 size-4',
                  modelValue.includes(opt.name) ? 'opacity-100' : 'opacity-0',
                )"
              />
              <div :class="cn('mr-2 size-2 rounded-full border', getLibraryColorClasses(opt.color))" />
              <span>{{ opt.name }}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
