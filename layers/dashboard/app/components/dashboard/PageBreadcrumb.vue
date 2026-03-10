<script setup lang="ts">
defineProps<{
  items: { title: string, url: string }[]
}>()
</script>

<template>
  <Breadcrumb
    class="
      max-w-[200px]
      sm:max-w-none
    "
  >
    <BreadcrumbList class="flex-nowrap whitespace-nowrap">
      <template v-for="(item, index) in items" :key="item.url">
        <!-- Hide first item on mobile to save space if there are many items -->
        <BreadcrumbItem
          v-if="index > 0 || items.length < 3"
          :class="{ 'hidden sm:block': index === 0 && items.length >= 3 }"
        >
          <BreadcrumbLink v-if="index < items.length - 1" as-child>
            <NuxtLink
              :to="item.url" class="
                max-w-[80px] truncate
                sm:max-w-none
              "
            >
              {{ $t(item.title) !== item.title ? $t(item.title) : item.title }}
            </NuxtLink>
          </BreadcrumbLink>
          <BreadcrumbPage
            v-else class="
              max-w-[120px] truncate
              sm:max-w-none
            "
          >
            {{ $t(item.title) !== item.title ? $t(item.title) : item.title }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator
          v-if="index < items.length - 1 && (index > 0 || items.length < 3)"
          :class="{ 'hidden sm:block': index === 0 && items.length >= 3 }"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
