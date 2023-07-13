<script>
  import { onMount, onDestroy } from 'svelte'
  import { rootnames, trimInfo, isEditing } from './stores.js'
  import { createEventDispatcher } from 'svelte'
  import { stopEditingFilename, handleViewQuadrant, toggleFullscreen, toggleTrimming, handleDownloadAction, handleClipboardAction, canIgnoreKeydown, updateRootnameStore } from './utils.js'

  export let index
  $: currentIndex = $trimInfo.index

  const dispatch = createEventDispatcher()

  const handleKeydown = event => {
    if ($isEditing && event.key === 'Enter') {
      stopEditingFilename(event, index)
      return
    }
    if (canIgnoreKeydown()) return

    const keyActions = {
      1: () => handleViewQuadrant(1, dispatch),
      c: () => handleClipboardAction(),
      t: () => toggleTrimming(),
      f: () => toggleFullscreen(dispatch),
      d: () => (event.shiftKey ? handleDownloadAction(currentIndex, dispatch) : handleDownloadAction(currentIndex, dispatch)),
      m: () => (index !== 0 ? trimInfo.update(state => ({ ...state, index: 0, mode: 'whole' })) : trimInfo.update(state => ({ ...state, index: 1, mode: 'quadrant' }))),
      Enter: () => startEditingFilename(index),
      Escape: () => {
        trimInfo.update(state => ({ ...state, cancelTrim: true, isDefined: false }))
      },
      '[': () => {
        if (index === 0 || !isFullScreen) return
        const newIndex = index === 1 ? 4 : (index - 1) % 4
        trimInfo.update(state => ({ ...state, index: newIndex }))
      },
      ']': () => {
        if (index === 0 || !isFullScreen) return
        const newIndex = index === 4 ? 1 : (index + 1) % 5
        trimInfo.update(state => ({ ...state, index: newIndex }))
      }
    }

    const action = keyActions[event.key]

    if (action) {
      event.preventDefault()
      action(event)
    }
  }
  onMount(() => document.addEventListener('keydown', handleKeydown))
  onDestroy(() => document.removeEventListener('keydown', handleKeydown))
</script>
