<script>
  import { tick, onMount, onDestroy } from 'svelte'
  import { rootnames, trimInfo } from './stores.js'
  import { createEventDispatcher } from 'svelte'
  import TrimControl from './TrimControl.svelte'

  export let index
  export let frameSpecs

  let mode
  let isEditing = false
  let isFullscreen = false
  let isTrimming = false
  let editableDiv

  const dispatch = createEventDispatcher()

  let currentName = $rootnames[index]
  $: if (isEditing) tick().then(() => setCursorToEnd(editableDiv))
  $: if ($trimInfo.cancelTrim) {
    isTrimming = false
    trimInfo.update(state => ({ ...state, cancelTrim: false, isDefined: false }))
  }
  $: mode = $trimInfo.mode

  onMount(() => document.addEventListener('keydown', handleKeydown))
  onDestroy(() => document.removeEventListener('keydown', handleKeydown))

  const handleBlur = event => {
    isTrimming = false
    isFullscreen = false
  }

  const setCursorToEnd = element => {
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const updateRootnameStore = (index, newValue) => {
    rootnames.update(arr => {
      const updatedArr = [...arr]
      updatedArr[index] = newValue
      return updatedArr
    })
  }
  const startEditingFilename = () => (isEditing = true)
  const stopEditingFilename = event => {
    console.log('stopEditingFilename')
    updateRootnameStore(index, event.target.textContent)
    isEditing = false
  }
  const toggleFullscreen = () => {
    isFullscreen = !isFullscreen
    if (!isFullscreen) isTrimming = false
    dispatch('expandaction')
  }
  const toggleTrimming = () => {
    isTrimming = !isTrimming
  }
  const handleDownloadAction = () => {
    if (index !== $trimInfo.index) return
    dispatch('imageaction', 'download')
  }
  const handleClipboardAction = () => {
    if (index !== $trimInfo.index) return
    dispatch('imageaction', 'clipboard')
  }
  const xhandleKeyDown = event => {
    return
  }
  const handleViewQuadrant = keyedIndex => {
    // trimInfo.update(state => ({ ...state, index: keyedIndex, mode: 'quadrant' }))

    if (!isFullscreen) isTrimming = false
    $trimInfo.isExpanded = true
    // trimInfo.update(state => ({ ...state, index: keyedIndex, mode: 'quadrant' }))
    dispatch('expandaction')
  }
  const handleKeydown = event => {
    if (isEditing && event.key === 'Enter') {
      stopEditingFilename(event)
      return
    }
    if (canIgnoreKeydown()) return // don’t allow key presses to switch tools if user is editing text

    //  if (newMode === 'quadrant') trimInfo.update(state => ({ ...state, index: 1 }))
    // if (newMode === 'whole') trimInfo.update(state => ({ ...state, index: 0 }))

    const keyActions = {
      1: () => handleViewQuadrant(1),
      c: () => handleClipboardAction(),
      t: () => toggleTrimming(),
      f: () => toggleFullscreen(),
      d: () => (event.shiftKey ? handleDownloadAction() : handleDownloadAction()),
      m: () => (index !== 0 ? trimInfo.update(state => ({ ...state, index: 0, mode: 'whole' })) : trimInfo.update(state => ({ ...state, index: 1, mode: 'quadrant' }))),
      Enter: () => startEditingFilename(),
      Escape: () => {
        trimInfo.update(state => ({ ...state, cancelTrim: true, isDefined: false }))
      },
      '[': () => {
        if (index === 0 || !isFullscreen) return
        const newIndex = index === 1 ? 4 : (index - 1) % 4
        trimInfo.update(state => ({ ...state, index: newIndex }))
      },
      ']': () => {
        if (index === 0 || !isFullscreen) return
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
  function canIgnoreKeydown() {
    const ae = document.activeElement
    const cannotIgnore = ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.tagName === 'FORM' || ae.contentEditable === 'true'
    return cannotIgnore
  }
</script>

<div class:triminprogress={$trimInfo.triminprogress} on:blur={handleBlur}>
  {#if isTrimming}
    <div class="trim-action">
      <TrimControl {frameSpecs} />
    </div>
  {/if}

  <div class="image-action">
    <div class="controls-wrapper">
      <div class="filename-area">
        <!-- <h1 style="position:fixed;left:50%;top:50%;color:white">{index}</h1> -->
        {#if isEditing}
          <div class="filename-text editing" tabindex="0" on:blur={stopEditingFilename} bind:this={editableDiv} bind:textContent={currentName} on:click|stopPropagation contenteditable>
            {currentName}
          </div>
        {:else}
          <div class="filename-text" tabindex="0" on:focus={startEditingFilename} on:click={startEditingFilename}>{currentName}</div>
        {/if}
        <button class="icon-download" on:click={handleDownloadAction} />
      </div>
      <button class="icon-clipboard" on:click={handleClipboardAction} />
    </div>
    <div class="isolate-controls">
      {#if mode !== 'quadrant' || isFullscreen}
        <button tabindex="0" class={`isolate-control ${isTrimming ? 'icon-trimactive' : 'icon-triminactive'}`} on:click={() => toggleTrimming()} />
      {/if}
      {#if mode === 'quadrant'}
        <button tabindex="0" class={`isolate-control ${isFullscreen ? 'icon-shrink' : 'icon-expand'}`} on:click={() => toggleFullscreen()} />
      {/if}
    </div>
  </div>
</div>

<style>
  .triminprogress .trim-action {
    z-index: 1;
  }
  .image-action {
    transition: opacity 0.2s ease-in-out, display 0s linear;

    transition-delay: 0ms, 0.1s;
  }
  .triminprogress .image-action {
    transition-delay: 0ms, 0.1s;
    z-index: 0;
    pointer-events: none;
    user-select: none;
    opacity: 0;
    display: none;
  }
  .isolate-controls {
    display: flex;
    flex-direction: row;
    border: none;
    position: absolute;
    gap: calc(var(--apppadding) / 2);
    top: 0;
    right: 0;
  }
  .image-action {
    width: calc(100% - var(--apppadding) * 2);
    top: var(--apppadding);
    left: var(--apppadding);
    bottom: var(--apppadding);
    right: var(--apppadding);
    position: absolute;
    display: block;
    bottom: 0;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    transform: scale(0.97);
    pointer-events: none;
    overflow: hidden;
  }
  .image-action > * {
    pointer-events: all;
  }
  :global(.active) .image-action {
    visibility: visible;
    opacity: 1;
    transform: scale(1);
  }
  .controls-wrapper {
    display: flex;
    width: 100%;
    position: absolute;
    bottom: var(--apppadding);
    gap: calc(var(--apppadding) / 2);
    align-items: center;
    justify-content: space-between;
  }
  .icon-clipboard,
  .icon-download,
  .icon-expand,
  .icon-shrink,
  .icon-trimactive,
  .icon-triminactive {
    display: block;
    width: 2.625rem;
    height: 2.625rem;
    min-width: 2.625rem;
    min-height: 2.625rem;
    background-repeat: no-repeat;
    background-size: 2rem;
    background-position: center;
    transition: opacity 0.4s ease-in-out, background-color 0.2s ease-in-out;
    background-color: rgba(80, 80, 80, 0.7);
    border-radius: 100px;
    border: none;
  }
  .icon-trimactive,
  .icon-triminactive {
    background-size: 3.5rem;
  }
  :global(.active) .icon-expand,
  :global(.active) .icon-shrink,
  :global(.active) .icon-trimactive,
  :global(.active) .icon-triminactive {
    visibility: visible;
    opacity: 0.82;
  }
  .icon-clipboard:hover,
  .icon-download:hover,
  .icon-expand:hover,
  .icon-shrink:hover,
  :global(.active) .icon-clipboard:hover,
  :global(.active) .icon-download:hover,
  :global(.active) .icon-expand:hover,
  :global(.active) .icon-shrink:hover,
  :global(.active) .icon-trimactive:hover,
  :global(.active) .icon-triminactive:hover {
    background-color: rgba(80, 80, 80, 0.92);
    opacity: 1;
  }
  .filename-area {
    position: relative;
    min-height: var(--toprowheight);
    background-color: var(--darkbackground-trans);
    border-radius: 200px;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    opacity: 1;
    transition: opacity 0.12s ease-in-out, transform 0.3s ease-in-out;
    bottom: 0;
    padding: 0;
    padding-right: 0.75rem;
    padding-left: 1.3125rem;
    flex-shrink: 1;
    flex-grow: 0;
    flex-basis: 100%;
    justify-content: space-between;
  }
  .active .filename-area {
    opacity: 1;
    transform: translateY(0);
  }
  .filename-text {
    color: #ccc;
    font-size: 0.85rem;
    line-height: 1.33;
    text-align: left;
    font-weight: normal;
    padding: 0.0625rem 0.375rem;
    line-break: anywhere;
    border: 1px dashed transparent;
    border-radius: 12px;
    transition: background-color 0.2s ease-in-out;
    cursor: pointer;
    outline: none;
    caret-color: white;
  }
  .filename-text::selection {
    background: rgb(45, 84, 97);
  }
  .filename-text::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - var(--toprowheight));
    height: 100%;
  }
  .filename-text.editing {
    color: #fff;
    outline: none;
    cursor: text;
    outline: 1px dotted rgba(255, 255, 255, 0.5);
    outline-offset: 0.5rem;
  }
</style>
