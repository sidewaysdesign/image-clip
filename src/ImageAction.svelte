<script>
  import { tick } from 'svelte'
  import { rootnames, cropinfo } from './stores.js'
  import { createEventDispatcher } from 'svelte'
  import CropControl from './CropControl.svelte'

  export let index
  export let mode
  export let frameSpecs

  let isEditing = false
  let isFullscreen = false
  let isCropping = false
  let editableDiv

  const dispatch = createEventDispatcher()

  let currentName = $rootnames[index]
  $: if (isEditing) tick().then(() => setCursorToEnd(editableDiv))
  $: if ($cropinfo.cancelCrop) {
    isCropping = false
    cropinfo.update(state => ({ ...state, cancelCrop: false }))
  }
  const handleBlur = event => {
    isCropping = false
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
    updateRootnameStore(index, event.target.textContent)
    isEditing = false
  }
  const handleFilenameExit = event => {
    if (event.type === 'keydown' && event.keyCode === 13) {
      event.preventDefault()
      stopEditingFilename(event)
    }
    if (event.type === 'blur') {
      stopEditingFilename(event)
    }
  }
  const toggleFullscreen = () => {
    isFullscreen = !isFullscreen
    if (!isFullscreen) isCropping = false
    dispatch('expandaction')
  }
  const toggleCropping = () => {
    isCropping = !isCropping
  }
</script>

<div class:cropinprogress={$cropinfo.cropinprogress} on:blur={handleBlur}>
  {#if isCropping}
    <div class="crop-action">
      <CropControl {frameSpecs} />
    </div>
  {/if}

  <div class="image-action">
    <div class="controls-wrapper">
      <div class="filename-area">
        {#if isEditing}
          <div class="filename-text editing" tabindex="0" bind:this={editableDiv} bind:textContent={currentName} on:blur={handleFilenameExit} on:keydown={handleFilenameExit} on:click|stopPropagation contenteditable>
            {currentName}
          </div>
        {:else}
          <div class="filename-text" tabindex="0" on:focus={startEditingFilename} on:click={startEditingFilename}>{currentName}</div>
        {/if}
        <button class="icon-download" on:click={() => dispatch('imageaction', 'download')} />
      </div>
      <button class="icon-clipboard" on:click={() => dispatch('imageaction', 'clipboard')} />
    </div>
    <div class="isolate-controls">
      {#if mode !== 'quadrant' || isFullscreen}
        <button tabindex="1" class={`isolate-control ${isCropping ? 'icon-cropactive' : 'icon-cropinactive'}`} on:click={() => toggleCropping()} />
      {/if}
      {#if mode === 'quadrant'}
        <button tabindex="2" class={`isolate-control ${isFullscreen ? 'icon-shrink' : 'icon-expand'}`} on:click={() => toggleFullscreen()} />
      {/if}
    </div>
  </div>
</div>

<style>
  .cropinprogress .crop-action {
    z-index: 1;
  }
  .image-action {
    transition: opacity 0.1s ease-in-out, display 0s linear;
    transition-delay: 0ms, 0.1s;
  }
  .cropinprogress .image-action {
    transition: opacity 0.1s ease-in-out, display 0s linear;
    transition-delay: 0ms, 0.1s;
    z-index: 0;
    pointer-events: none;
    user-select: none;
    opacity: 0 !important;
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
  .icon-expand {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxwb2x5bGluZSBwb2ludHM9IjQwLjQ2NSAxMS4yNjggNTIuNzMyIDExLjI2OCA1Mi43MzIgMjMuNTM1IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjQuNzVweDsiLz48cG9seWxpbmUgcG9pbnRzPSIxMS4yNjggMjMuNTM1IDExLjI2OCAxMS4yNjggMjMuNTM1IDExLjI2OCIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo0Ljc1cHg7Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjMuNTM1IDUyLjczMiAxMS4yNjggNTIuNzMyIDExLjI2OCA0MC40NjUiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NC43NXB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjUyLjczMiA0MC40NjUgNTIuNzMyIDUyLjczMiA0MC40NjUgNTIuNzMyIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjQuNzVweDsiLz48L3N2Zz4=');
  }
  .icon-shrink {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxwb2x5bGluZSBwb2ludHM9IjUyLjI2NiAyNC4wMDEgMzkuOTk5IDI0LjAwMSAzOS45OTkgMTEuNzM0IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjQuNzVweDsiLz48cG9seWxpbmUgcG9pbnRzPSIyNC4wMDEgMTEuNzM0IDI0LjAwMSAyNC4wMDEgMTEuNzM0IDI0LjAwMSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo0Ljc1cHg7Ii8+PHBvbHlsaW5lIHBvaW50cz0iMTEuNzM0IDM5Ljk5OSAyNC4wMDEgMzkuOTk5IDI0LjAwMSA1Mi4yNjYiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NC43NXB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjM5Ljk5OSA1Mi4yNjYgMzkuOTk5IDM5Ljk5OSA1Mi4yNjYgMzkuOTk5IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjQuNzVweDsiLz48L3N2Zz4=');
  }
  .icon-clipboard {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3QgeD0iMjMuOTc1IiB5PSI4LjQzNyIgd2lkdGg9IjI3LjA3NSIgaGVpZ2h0PSIzNi4xIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjQuNzVweDsiLz48cG9seWxpbmUgcG9pbnRzPSI0MS4wMjUgNTUuNTYyIDEzLjk1IDU1LjU2MiAxMy45NSAxOS40NjIiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NC43NXB4OyIvPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgc3R5bGU9ImZpbGw6bm9uZTsiLz48L3N2Zz4=');
  }
  .icon-download {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxwYXRoIGQ9Im0xMC4yOTEsNDMuNTM5djcuNjM5YzAsMS45OTgsMS42MiwzLjYxOCwzLjYxOCwzLjYxOGgzNi4xODFjMS45OTgsMCwzLjYxOC0xLjYyLDMuNjE4LTMuNjE4di03LjYzOSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo0Ljc1cHg7Ii8+PHBvbHlsaW5lIHBvaW50cz0iNDMuNzAyIDMyLjQ0NSAzMiA0NC4wNzkgMjAuMjk4IDMyLjQ0NSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo0Ljc1cHg7Ii8+PGxpbmUgeDE9IjMyIiB5MT0iNDQuMDc5IiB4Mj0iMzIiIHkyPSIxMC4yMDMiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NC43NXB4OyIvPjwvc3ZnPg==');
  }
  .icon-cropactive {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiPgogICAgPGRlZnM+CiAgICAgICAgPG1hc2sgaWQ9Im1hc2siPgogICAgICAgICAgICA8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0id2hpdGUiLz4KICAgICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz0iNjAuMDMxIDQ2LjgyMSA4MS4xNzkgNDYuODIxIDgxLjE3OSA5MS4zOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjZweCIvPgogICAgICAgICAgICA8bGluZSB4MT0iMzYuNjEiIHkxPSI0Ni44MjEiIHgyPSI0Ni44MjEiIHkyPSI0Ni44MjEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSI2cHgiLz4KICAgICAgICAgICAgPGxpbmUgeDE9IjgxLjE3OSIgeTE9IjgxLjE3OSIgeDI9IjkxLjM5IiB5Mj0iODEuMTc5IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iNnB4Ii8+CiAgICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9IjY3Ljk2OSA4MS4xNzkgNDYuODIxIDgxLjE3OSA0Ni44MjEgMzYuNjEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSI2cHgiLz4KICAgICAgICA8L21hc2s+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0id2hpdGUiIG1hc2s9InVybCgjbWFzaykiLz4KPC9zdmc+');
  }
  .icon-cropinactive {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiPgogICAgPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHN0eWxlPSJmaWxsOm5vbmU7Ii8+CiAgICA8cG9seWxpbmUgcG9pbnRzPSI2MC4wMzEgNDYuODIxIDgxLjE3OSA0Ni44MjEgODEuMTc5IDkxLjM5IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjZweDsiLz4KICAgIDxsaW5lIHgxPSIzNi42MSIgeTE9IjQ2LjgyMSIgeDI9IjQ2LjgyMSIgeTI9IjQ2LjgyMSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo2cHg7Ii8+CiAgICA8bGluZSB4MT0iODEuMTc5IiB5MT0iODEuMTc5IiB4Mj0iOTEuMzkiIHkyPSI4MS4xNzkiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6NnB4OyIvPgogICAgPHBvbHlsaW5lIHBvaW50cz0iNjcuOTY5IDgxLjE3OSA0Ni44MjEgODEuMTc5IDQ2LjgyMSAzNi42MSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo2cHg7Ii8+Cjwvc3ZnPg==');
  }
  .icon-clipboard,
  .icon-download,
  .icon-expand,
  .icon-shrink,
  .icon-cropactive,
  .icon-cropinactive {
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
  .icon-cropactive,
  .icon-cropinactive {
    background-size: 3.5rem;
  }
  :global(.active) .icon-expand,
  :global(.active) .icon-shrink,
  :global(.active) .icon-cropactive,
  :global(.active) .icon-cropinactive {
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
  :global(.active) .icon-cropactive:hover,
  :global(.active) .icon-cropinactive:hover {
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
    padding-left: 1.5rem;
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
    color: white;
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
    /* max-width: calc(100vw - var(--toprowheight) * 2 + var(-apppadding)); */
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
    outline: none;
    cursor: text;
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
