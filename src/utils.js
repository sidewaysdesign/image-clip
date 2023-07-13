import { get } from 'svelte/store'
import { isFullScreen, isEditing, isTrimming, rootnames, trimInfo } from './stores.js'

export const handleViewQuadrant = (keyedIndex, dispatch) => {
  console.log('FUNC handleViewQuadrant')
  if (!get(isFullScreen)) isTrimming.set(false)
  toggleFullscreen(dispatch)
  trimInfo.update(state => ({ ...state, index: keyedIndex, mode: 'quadrant' }))
  dispatch('expandaction')
}

export const toggleFullscreen = dispatch => {
  console.log('FUNC toggleFullscreen')
  isFullScreen.update(value => !value)
  if (!get(isFullScreen)) isTrimming.set(false)
  dispatch('expandaction')
}
export const toggleTrimming = () => {
  console.log('FUNC toggleTrimming')
  isTrimming.update(value => !value)
}
export const handleDownloadAction = (index, dispatch) => {
  if (index !== get(trimInfo).index) return
  dispatch('imageaction', 'download')
}
export const handleClipboardAction = (index, dispatch) => {
  if (index !== get(trimInfo).index) return
  dispatch('imageaction', 'clipboard')
}
export const stopEditingFilename = (event, index) => {
  console.log('FUNC stopEditingFilename')
  if (!event || !event.target) return
  const newName = event.target.innerText
  updateRootnameStore(index, newName)
  isEditing.set(false)
}

export const updateRootnameStore = (index, newValue) => {
  console.log('FUNC updateRootnameStore')
  rootnames.update(arr => {
    const updatedArr = [...arr]
    updatedArr[index] = newValue
    return updatedArr
  })
}
export const canIgnoreKeydown = () => {
  console.log('FUNC canIgnoreKeydown')
  const ae = document.activeElement
  const cannotIgnore = ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.tagName === 'FORM' || ae.contentEditable === 'true'
  return cannotIgnore
}
