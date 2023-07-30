// stores.js
import { writable, readable } from 'svelte/store'
const storageName = 'colorMixerParams'
const storedParams = localStorage.getItem(storageName)
const defaultParams = {
  mode: 'whole'
}

export const rootnames = writable([])
export const trimInfo = writable({
  triminprogress: false,
  isDefined: false,
  cancelTrim: false,
  index: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  mode: 'whole',
  expanded: false
})
export const rectState = writable({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  update: false
})
export const sourceImage = writable({
  width: 0,
  height: 0,
  originalUrl: '',
  url: '',
  extension: ''
})
export const isTrimming = writable(false)
export const popupOpen = writable(false)
export const isEditing = writable(false)
export const isEditingElement = writable(null)
export const isFullScreen = writable(false)
export const isTransitioning = writable(false)
export const lastHovered = writable(null)
export const originalName = writable('')
export const editingElement = writable(null)
export const params = writable(storedParams ? { ...defaultParams, ...JSON.parse(storedParams) } : defaultParams)
export const quadsuffix = readable('_quad')
params.subscribe(updatedParams => {
  localStorage.setItem(storageName, JSON.stringify(updatedParams))
})
