<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  // import { get } from 'svelte/store'
  import { rootnames, trimInfo, isEditing, isFullScreen, originalName, editingElement } from './stores.js'
  import { toggleFullscreen, toggleTrimming, handleDownloadAction, canIgnoreKeydown } from './utils.js'

  export let index
  $: currentIndex = $trimInfo.index

  const dispatch = createEventDispatcher()
  const startEditingFilename = index => {
    originalName.set($rootnames[index])
    isEditing.set(true)
  }

  const quadSwitch = index => {
    if ($trimInfo.mode !== 'quadrant') trimInfo.update(state => ({ ...state, index, mode: 'quadrant' }))
    dispatch('switchquadrant', { index })
  }

  const modeSwitchHandler = () => {
    if (index !== 0) {
      if ($trimInfo.expanded) dispatch('expandaction')
      trimInfo.update(state => ({ ...state, index: 0, mode: 'whole' }))
    } else {
      trimInfo.update(state => ({ ...state, index: 1, mode: 'quadrant' }))
    }
  }

  const keyClipboardHandler = e => {
    dispatch('copytoclipboard', { index: currentIndex })
  }
  const downloadFileHandler = e => {
    dispatch('downloadfile', { index: currentIndex })
  }
  const downloadAllHandler = e => {
    if ($trimInfo.isDefined) return
    if (currentIndex == 0) {
      dispatch('downloadfile', { index: 0 })
    } else {
      dispatch('downloadall')
    }
  }
  const blurAnythingActive = () => {
    console.log('blurAnythingActive')
    const activeElement = document.activeElement
    // if (activeElement && activeElement.getAttribute('contenteditable')) {
    if (activeElement) {
      activeElement.blur()
      event.preventDefault() // This prevents the creation of a new line
      return
    }
  }
  const handleKeydown = event => {
    if ($isEditing && event.key === 'Enter') {
      blurAnythingActive()
      return
    }
    if (canIgnoreKeydown()) return

    const keyActions = {
      1: () => quadSwitch(1),
      2: () => quadSwitch(2),
      3: () => quadSwitch(3),
      4: () => quadSwitch(4),
      c: () => keyClipboardHandler(),
      t: () => toggleTrimming(),
      f: () => toggleFullscreen(currentIndex, dispatch),
      D: () => downloadAllHandler(),
      d: () => downloadFileHandler(),
      m: () => modeSwitchHandler(),
      Enter: () => startEditingFilename(index),
      Escape: () => {
        blurAnythingActive()
        trimInfo.update(state => ({ ...state, cancelTrim: true, isDefined: false }))
      },
      '[': () => {
        if (index === 0 || !$isFullScreen) return
        const newIndex = index === 1 ? 4 : (index - 1) % 4
        trimInfo.update(state => ({ ...state, index: newIndex }))
      },
      ']': () => {
        if (index === 0 || !$isFullScreen) return
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
