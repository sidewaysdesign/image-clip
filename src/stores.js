// store.js
import { writable } from 'svelte/store'

// Create a writable store with an initial value of an empty array
export const rootnames = writable([])
export const cropinfo = writable({
  cropinprogress: false,
  isDefined: false,
  cancelCrop: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0
})
