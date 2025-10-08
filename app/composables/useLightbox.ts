import { ref } from 'vue'

export function useLightbox() {
  const lightboxEl = ref<HTMLImageElement>()
  const isLightboxOpening = ref(false)

  function openLightbox(e: MouseEvent) {
    if (e.target instanceof HTMLImageElement) {
      lightboxEl.value = e.target
      isLightboxOpening.value = true
    }
  }

  function closeLightbox() {
    isLightboxOpening.value = false
  }

  return {
    lightboxEl,
    isLightboxOpening,
    openLightbox,
    closeLightbox,
  }
}
