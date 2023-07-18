<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { rootnames, trimInfo, isEditing, isFullScreen, originalName, params, isTrimming, rectState, sourceImage } from './stores.js'
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
  const nudgeTrim = (directionX, directionY, event) => {
    let { x, y, width, height } = $rectState
    console.table({ x, y, width, height })

    let nudgeValue = event.shiftKey ? 10 : 1 // Adjust the nudge size based on if the shift key is pressed
    let extendValue = event.ctrlKey ? nudgeValue : 0 // Only extend when Ctrl is pressed

    let newX = x + directionX * (directionX < 0 ? 2 : 1) * nudgeValue - extendValue * directionX
    let newY = y + directionY * (directionY < 0 ? 2 : 1) * nudgeValue - extendValue * directionY
    let newWidth = width + extendValue * Math.abs(directionX)
    let newHeight = height + extendValue * Math.abs(directionY)

    // Check for boundaries and adjust the nudges accordingly
    if (newX < 0) {
      newX = 0
      newWidth = x + width // keep the right edge constant
    }
    if (newY < 0) {
      newY = 0
      newHeight = y + height // keep the bottom edge constant
    }

    // Check if the new frame exceeds the image width
    if (newX + newWidth > $sourceImage.width) {
      // If extending, adjust the width to not exceed the image's width
      if (extendValue > 0) newWidth = $sourceImage.width - newX
      // If moving, adjust the X position to not exceed the image's width minus the frame width
      else newX = $sourceImage.width - newWidth
    }

    // Check if the new frame exceeds the image height
    if (newY + newHeight > $sourceImage.height) {
      // If extending, adjust the height to not exceed the image's height
      if (extendValue > 0) newHeight = $sourceImage.height - newY
      // If moving, adjust the Y position to not exceed the image's height minus the frame height
      else newY = $sourceImage.height - newHeight
    }

    rectState.update(state => ({ ...state, x: newX, y: newY, width: newWidth, height: newHeight, update: true }))
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
      ArrowLeft: e => nudgeTrim(-1, 0, e),
      ArrowUp: e => nudgeTrim(0, -1, e),
      ArrowRight: e => nudgeTrim(1, 0, e),
      ArrowDown: e => nudgeTrim(0, 1, e),
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
