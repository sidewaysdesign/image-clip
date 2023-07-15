import { get } from 'svelte/store'
import { isFullScreen, isTrimming, trimInfo } from './stores.js'

export const toggleFullscreen = (index, dispatch) => {
  console.log('FUNC toggleFullscreen')
  // if (index !== get(trimInfo).index) return
  isFullScreen.update(value => !value)
  if (!get(isFullScreen)) isTrimming.set(false)
  dispatch('expandaction')
}
export const toggleTrimming = () => {
  console.log('FUNC toggleTrimming')
  isTrimming.update(value => !value)
}
export const handleDownloadAction = (index, dispatch) => {
  console.log('handleDownloadAction', index, get(trimInfo).index)
  if (index !== get(trimInfo).index) return
  dispatch('imageaction', 'download')
}
export const handleClipboardAction = (index, dispatch) => {
  if (index !== get(trimInfo).index) return
  console.log('FUNC handleClipboardAction', index, get(trimInfo).index, index !== get(trimInfo).index)
  dispatch('imageaction', 'clipboard')
}

export const canIgnoreKeydown = () => {
  const ae = document.activeElement
  const cannotIgnore = ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.tagName === 'FORM' || ae.contentEditable === 'true'
  return cannotIgnore
}
