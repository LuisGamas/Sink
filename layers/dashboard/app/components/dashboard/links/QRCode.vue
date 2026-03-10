<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import QRCodeStyling from 'qr-code-styling'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const color = ref('#000000')

const qrCode = new QRCodeStyling({
  width: 256,
  height: 256,
  type: 'canvas',
  margin: 10,
  qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2, crossOrigin: 'anonymous' },
  dotsOptions: { type: 'dots', color: '#000000' },
  backgroundOptions: { color: '#ffffff' },
  cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
  cornersDotOptions: { type: 'dot', color: '#000000' },
})

const qrCodeEl = useTemplateRef<HTMLElement>('qrCodeEl')

function updateQr() {
  qrCode.update({
    data: props.data,
    image: props.image || '/icon.png',
    dotsOptions: { color: color.value },
    cornersSquareOptions: { color: color.value },
    cornersDotOptions: { color: color.value },
  })
}

// Watch for any changes in props or color to update the QR
watch([() => props.data, () => props.image, color], () => {
  updateQr()
}, { immediate: true })

function downloadQRCode() {
  const slug = props.data.split('/').pop()
  qrCode.download({
    extension: 'png',
    name: `qr_${slug}`,
  })
}

onMounted(() => {
  if (qrCodeEl.value) {
    qrCode.append(qrCodeEl.value)
    updateQr()
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      ref="qrCodeEl"
      :data-text="data"
      class="rounded-lg bg-white p-1"
    />
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
        @click="downloadQRCode"
      >
        <Download class="mr-2 h-4 w-4" />
        {{ $t('links.download_qr_code') }}
      </Button>
    </div>
  </div>
</template>
