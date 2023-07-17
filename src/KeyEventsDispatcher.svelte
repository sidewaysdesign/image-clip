<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { rootnames, trimInfo, isEditing, isFullScreen, originalName, params, isTrimming } from './stores.js'
  import { toggleFullscreen, toggleTrimming, canIgnoreKeydown } from './utils.js'

  $: currentIndex = $trimInfo.index
  $: if ($trimInfo.cancelTrim) {
    isTrimming.set(false)
    trimInfo.update(state => ({ ...state, cancelTrim: false, isDefined: false, triminprogress: false }))
  }

  const dispatch = createEventDispatcher()
  const startEditingFilename = index => {
    if ($isEditing) {
      isEditing.set(false)
      return
    }
    originalName.set($rootnames[index])
    isEditing.set(true)
  }
  const quadSwitch = index => {
    if ($params.mode !== 'quadrant') {
      trimInfo.update(state => ({ ...state, index, cancelTrim: true }))
      params.update(state => ({ ...state, mode: 'quadrant' }))
    }
    dispatch('switchquadrant', { index })
  }

  const modeSwitchHandler = () => {
    trimInfo.update(state => ({ ...state, cancelTrim: true }))
    if ($params.mode === 'whole') {
      modeSwitchToQuads()
    } else {
      modeSwitchToWhole()
    }
  }
  const modeSwitchToQuads = () => {
    params.update(state => ({ ...state, mode: 'quadrant' }))
    trimInfo.update(state => ({ ...state, index: 1, isDefined: false }))
  }
  const modeSwitchToWhole = () => {
    isTrimming.set(false)
    params.update(state => ({ ...state, mode: 'whole' }))
    trimInfo.update(state => ({ ...state, index: 0, expanded: false, isDefined: false, triminprogress: false }))
    isFullScreen.set(false)
  }
  const keyClipboardHandler = e => {
    dispatch('copytoclipboard', { index: currentIndex })
  }
  const downloadFileHandler = e => {
    dispatch('downloadfile', { index: currentIndex })
  }
  const downloadAllHandler = e => {
    if ($isEditing || $isTrimming) return
    dispatch('downloadall')
  }
  const blurAnythingActive = () => {
    const activeElement = document.activeElement
    if (activeElement && activeElement instanceof HTMLElement) {
      activeElement.blur()
      event.preventDefault()
      return
    }
  }
  const handleBracketPress = increment => {
    // not currently implemented
    if (currentIndex === 0 || !$isFullScreen) return
    let newIndex = (currentIndex + increment + 4) % 4 || 4 // Ensure the index stays between 1 and 4
    currentIndex = newIndex
    quadSwitch(currentIndex)
  }
  const jumpX = () => {
    console.log('jumpy jump')
  }
  const handleKeydown = event => {
    if (event.metaKey || event.altKey) return // ignore system/app shortcuts
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
      x: () => jumpX(),
      Escape: () => {
        blurAnythingActive()
        trimInfo.update(state => ({ ...state, cancelTrim: true }))
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
