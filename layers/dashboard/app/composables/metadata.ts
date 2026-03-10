import { defineStore } from '#imports'
import { ref } from 'vue'

export interface MetadataItem {
  name: string
  color: string
  count: number
}

export interface MetadataResponse {
  folders: MetadataItem[]
  tags: MetadataItem[]
}

export const useMetadataStore = defineStore('metadata', () => {
  const folders = ref<MetadataItem[]>([])
  const tags = ref<MetadataItem[]>([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      const data = await useAPI<MetadataResponse>('/api/metadata')
      folders.value = data.folders
      tags.value = data.tags
    }
    catch (error) {
      console.error('Failed to fetch metadata:', error)
    }
    finally {
      loading.value = false
    }
  }

  return {
    folders,
    tags,
    loading,
    refresh: fetch,
  }
})
