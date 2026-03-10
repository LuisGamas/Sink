<script setup lang="ts">
import type { CounterData } from '@/types'
import NumberFlow from '@number-flow/vue'
import { watchThrottled } from '@vueuse/core'
import { Flame, MousePointerClick, Users } from 'lucide-vue-next'

const defaultData: CounterData = Object.freeze({
  visits: 0,
  visitors: 0,
  referers: 0,
})

const counters = ref<CounterData>(defaultData)
const loading = ref(true)

const id = inject(LINK_ID_KEY, computed(() => undefined))
const analysisStore = useDashboardAnalysisStore()

async function getLinkCounters() {
  const apiPath = '/api/stats/counters'
  const cached = analysisStore.getFromCache(apiPath)
  if (cached) {
    counters.value = cached?.[0] ?? defaultData
    loading.value = false
    return
  }

  loading.value = true
  try {
    const result = await useAPI<{ data: CounterData[] }>(apiPath, {
      query: {
        id: id.value,
        startAt: analysisStore.dateRange.startAt,
        endAt: analysisStore.dateRange.endAt,
        ...analysisStore.filters,
      },
    })
    const data = result.data?.[0] ?? defaultData
    counters.value = data
    analysisStore.setToCache(apiPath, result.data)
  }
  catch (error) {
    console.error('Failed to fetch link counters:', error)
  }
  finally {
    loading.value = false
  }
}

watchThrottled([() => analysisStore.dateRange, () => analysisStore.filters], getLinkCounters, {
  deep: true,
  throttle: 500,
  leading: true,
  trailing: true,
})

onMounted(async () => {
  getLinkCounters()
})
</script>

<template>
  <div
    class="
      grid gap-4
      sm:grid-cols-3 sm:gap-3
      lg:gap-4
    "
  >
    <Card
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0 }"
      class="gap-0"
    >
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.visits') }}
        </CardTitle>
        <MousePointerClick
          aria-hidden="true" class="h-4 w-4 text-muted-foreground"
        />
      </CardHeader>
      <CardContent>
        <Skeleton v-if="loading" class="h-8 w-24" />
        <NumberFlow v-else class="text-2xl font-bold tabular-nums" :value="counters.visits" />
      </CardContent>
    </Card>
    <Card
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      class="gap-0"
    >
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.visitors') }}
        </CardTitle>
        <Users aria-hidden="true" class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton v-if="loading" class="h-8 w-24" />
        <NumberFlow v-else class="text-2xl font-bold tabular-nums" :value="counters.visitors" />
      </CardContent>
    </Card>
    <Card
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
      class="gap-0"
    >
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.referers') }}
        </CardTitle>
        <Flame aria-hidden="true" class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton v-if="loading" class="h-8 w-24" />
        <NumberFlow v-else class="text-2xl font-bold tabular-nums" :value="counters.referers" />
      </CardContent>
    </Card>
  </div>
</template>
