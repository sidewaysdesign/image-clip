<script>
  import { tick } from 'svelte'
  import { rootnames } from './store-rootname.js'
  import { createEventDispatcher } from 'svelte'

  // let rootname
  export let index
  export let mode

  // let currentName = rootname
  let isEditing = false
  let isFullscreen = false
  let editableDiv

  const dispatch = createEventDispatcher()

  let currentName = $rootnames[index]
  $: if (isEditing) tick().then(() => setCursorToEnd(editableDiv))

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
  const startEditing = () => (isEditing = true)
  const stopEditing = event => {
    updateRootnameStore(index, event.target.textContent)
    isEditing = false
  }
  const toggleFullscreen = () => {
    isFullscreen = !isFullscreen
    dispatch('expandaction')
  }
  const handleExit = event => {
    if (event.type === 'keydown' && event.keyCode === 13) {
      event.preventDefault()
      stopEditing(event)
    }
    if (event.type === 'blur') {
      stopEditing(event)
    }
  }
</script>

<div class="image-action">
  <div class="controls-wrapper">
    <div class="filename-area">
      {#if isEditing}
        <div class="filename-text editing" bind:this={editableDiv} bind:textContent={currentName} on:blur={handleExit} on:keydown={handleExit} on:click|stopPropagation contenteditable>
          {currentName}
        </div>
      {:else}
        <div class="filename-text" on:click={startEditing}>{currentName}</div>
      {/if}
      <button class="icon-download" on:click={() => dispatch('imageaction', 'download')} />
    </div>
    <button class="icon-clipboard" on:click={() => dispatch('imageaction', 'clipboard')} />
  </div>
  {#if mode === 'quadrant'}
    <button class={`isolate-control ${isFullscreen ? 'icon-shrink' : 'icon-expand'}`} on:click={() => toggleFullscreen()}>
      <!-- <label class="tooltip">
      {isFullscreen ? 'Maximise' : 'Minimize'}
    </label> -->
    </button>
  {/if}
</div>

<style>
  .isolate-control {
    border: none;
    position: absolute;
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
  .icon-clipboard,
  .icon-download,
  .icon-expand,
  .icon-shrink {
    display: block;
    width: 2.625rem;
    height: 2.625rem;
    min-width: 2.625rem;
    min-height: 2.625rem;
    background-repeat: no-repeat;
    background-size: 2rem;
    background-position: center;
    transition: opacity 0.4s ease-in-out, background-color 0.2s ease-in-out;
    background-color: rgba(123, 123, 123, 0.7);
    border-radius: 100px;
    border: none;
  }
  :global(.active) .icon-expand,
  :global(.active) .icon-shrink {
    visibility: visible;
    opacity: 0.7;
  }
  .icon-clipboard:hover,
  .icon-download:hover,
  .icon-expand:hover,
  .icon-shrink:hover,
  :global(.active) .icon-clipboard:hover,
  :global(.active) .icon-download:hover,
  :global(.active) .icon-expand:hover,
  :global(.active) .icon-shrink:hover {
    background-color: rgba(123, 123, 123, 0.92);
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
