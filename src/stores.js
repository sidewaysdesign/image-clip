// store.js
import { writable } from 'svelte/store'

// Create a writable store with an initial value of an empty array
export const rootnames = writable([])
export const trimInfo = writable({
  triminprogress: false,
  isDefined: false,
  cancelTrim: false,
  expandIndex: 1,
  index: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  mode: 'whole'
})
export const isTrimming = writable(false)
