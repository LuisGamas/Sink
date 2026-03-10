<script setup lang="ts">
import { Download } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const color = ref('#000000')
const qrCodeEl = ref<HTMLElement | null>(null)
let qrCode: any = null

async function init() {
  if (!import.meta.client)
    return

  try {
    // Dynamic import to avoid SSR issues with canvas/document
    const { default: QRCodeStyling } = await import('qr-code-styling')

    qrCode = new QRCodeStyling({
      width: 260,
      height: 260,
      type: 'svg',
      data: props.data,
      image: '/icon.png', // Using local icon for stability
      margin: 10,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2, crossOrigin: 'anonymous' },
      dotsOptions: { type: 'dots', color: color.value },
      backgroundOptions: { color: '#ffffff' },
      cornersSquareOptions: { type: 'extra-rounded', color: color.value },
      cornersDotOptions: { type: 'dot', color: color.value },
    })

    if (qrCodeEl.value) {
      qrCodeEl.value.innerHTML = '' // Clear container
      qrCode.append(qrCodeEl.value)
    }
  }
  catch (err) {
    console.error('Failed to initialize QR code:', err)
  }
}

function updateQr() {
  if (qrCode) {
    qrCode.update({
      data: props.data,
      dotsOptions: { color: color.value },
      cornersSquareOptions: { color: color.value },
      cornersDotOptions: { color: color.value },
    })
  }
}

watch(color, () => {
  updateQr()
})

watch(() => props.data, () => {
  updateQr()
})

function downloadQRCode() {
  if (qrCode) {
    const slug = props.data.split('/').pop()
    qrCode.download({
      extension: 'png',
      name: `qr_${slug}`,
    })
  }
}

onMounted(() => {
  // Give Nuxt/Radix a moment to fully render the popover content
  nextTick(() => {
    setTimeout(init, 200)
  })
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      ref="qrCodeEl"
      class="
        flex min-h-[260px] min-w-[260px] items-center justify-center rounded-lg
        border bg-white p-1 shadow-sm
      "
    >
      <!-- Loading state if needed -->
      <div v-if="!qrCode" class="animate-pulse text-xs text-muted-foreground">
        Generating QR...
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="relative flex items-center">
        <div
          class="
            h-8 w-8 cursor-pointer overflow-hidden rounded-full border
            border-gray-300
            dark:border-gray-600
          "
          :style="{ backgroundColor: color }"
          :title="$t('links.change_qr_color')"
        >
          <input
            v-model="color"
            type="color"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            :title="$t('links.change_qr_color')"
          >
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="!qrCode"
        @click="downloadQRCode"
      >
        <Download class="mr-2 h-4 w-4" />
        {{ $t('links.download_qr_code') }}
      </Button>
    </div>
  </div>
</template>
