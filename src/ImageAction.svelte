<script>
  import { tick } from 'svelte'
  import { rootnames, trimInfo, isEditing, isFullScreen, isTrimming } from './stores.js'
  import { createEventDispatcher } from 'svelte'
  import { stopEditingFilename, toggleFullscreen, toggleTrimming, handleDownloadAction, handleClipboardAction, updateRootnameStore } from './utils.js'

  import TrimControl from './TrimControl.svelte'

  export let index
  export let frameSpecs

  let mode
  let editableDiv

  const dispatch = createEventDispatcher()

  const startEditingFilename = () => isEditing.set(true)

  let currentName = $rootnames[index]
  $: if ($isEditing) tick().then(() => setCursorToEnd(editableDiv))
  $: if ($trimInfo.cancelTrim) {
    isTrimming.set(false)
    trimInfo.update(state => ({ ...state, cancelTrim: false, isDefined: false }))
  }
  $: mode = $trimInfo.mode
  $: isThisIndex = $trimInfo.index === index

  const handleBlur = event => {
    isTrimming.set(false)
    isFullScreen.set(false)
  }

  const setCursorToEnd = element => {
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
</script>

<div class:triminprogress={$trimInfo.triminprogress} on:blur={handleBlur}>
  {#if $isTrimming && isThisIndex}
    <div class="trim-action">
      <TrimControl {frameSpecs} />
    </div>
  {/if}
  <div class="image-action">
    <div class="controls-wrapper">
      <div class="filename-area">
        {#if $isEditing}
          <div class="filename-text editing" tabindex="0" on:blur={() => stopEditingFilename(index)} bind:this={editableDiv} bind:textContent={currentName} on:click|stopPropagation contenteditable>
            {currentName}
          </div>
        {:else}
          <div class="filename-text" tabindex="0" on:focus={() => startEditingFilename(index)} on:click={() => startEditingFilename(index)}>{currentName}</div>
        {/if}
        <button class="icon-download" on:click={() => handleDownloadAction(index, dispatch)} />
      </div>
      <button class="icon-clipboard" on:click={() => handleClipboardAction(index, dispatch)} />
    </div>
    <div class="isolate-controls">
      {#if mode !== 'quadrant' || $isFullScreen}
        <button tabindex="0" class={`isolate-control ${$isTrimming ? 'icon-trimactive' : 'icon-triminactive'}`} on:click={() => toggleTrimming()} />
      {/if}
      {#if mode === 'quadrant'}
        <button tabindex="0" class={`isolate-control ${$isFullScreen && isThisIndex ? 'icon-shrink' : 'icon-expand'}`} on:click={() => toggleFullscreen(dispatch)} />
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
