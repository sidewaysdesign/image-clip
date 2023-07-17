import { get } from 'svelte/store'
import { isFullScreen, isTrimming, trimInfo } from './stores.js'

export const toggleFullscreen = (index, dispatch) => {
  // if (index !== get(trimInfo).index) return
  isTrimming.set(false)
  isFullScreen.update(value => !value)
  // if (!get(isFullScreen)) isTrimming.set(false)
  dispatch('expandaction')
}
export const toggleTrimming = () => {
  if (get(isTrimming)) {
    trimInfo.update(value => ({ ...value, cancelTrim: true }))
  } else {
    isTrimming.set(true)
  }
}
export const handleDownloadAction = (index, dispatch) => {
  if (index !== get(trimInfo).index) return
  dispatch('imageaction', 'download')
}
export const handleClipboardAction = (index, dispatch) => {
  if (index !== get(trimInfo).index) return
  dispatch('imageaction', 'clipboard')
}

export const canIgnoreKeydown = () => {
  const ae = document.activeElement
  const cannotIgnore = ae instanceof HTMLElement && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.tagName === 'FORM' || ae.contentEditable === 'true')
  return cannotIgnore
}
