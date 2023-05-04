<script>
  import { tick } from 'svelte'
  import { rootnames } from './store-rootname.js'
  import { createEventDispatcher } from 'svelte'
  import Clipboard from 'svelte-clipboard'

  export let rootname
  export let index
  export let imageElement
  export let imageExtension

  let currentName = rootname
  let isEditing = false
  let isFullscreen = false
  let editableDiv

  const dispatch = createEventDispatcher()

  const toastNotice = msg => dispatch('downloadaction', msg)

  $: rootnames.subscribe(value => rootname)
  $: if (isEditing) tick().then(() => setCursorToEnd(editableDiv))

  const setCursorToEnd = element => {
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
  const updateRootnameStore = newValue => {
    rootnames.update(arr => {
      const updatedArr = [...arr]
      updatedArr[index] = newValue
      return updatedArr
    })
  }
  // on:copy={() => toastAction(toFormat(color, colorFormat))}

  const downloadQuadrant = (mode = 'download') => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = imageElement.width
    canvas.height = imageElement.height
    ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height)

    const quadrantWidth = imageElement.width / 2
    const quadrantHeight = imageElement.height / 2
    const quadrantCanvas = document.createElement('canvas')
    const quadrantCtx = quadrantCanvas.getContext('2d')
    quadrantCanvas.width = quadrantWidth
    quadrantCanvas.height = quadrantHeight

    let sx, sy
    switch (index) {
      case 0:
        sx = 0
        sy = 0
        break
      case 1:
        sx = quadrantWidth
        sy = 0
        break
      case 2:
        sx = 0
        sy = quadrantHeight
        break
      case 3:
        sx = quadrantWidth
        sy = quadrantHeight
        break
    }

    quadrantCtx.drawImage(canvas, sx, sy, quadrantWidth, quadrantHeight, 0, 0, quadrantWidth, quadrantHeight)

    const dataUrl = quadrantCanvas.toDataURL('image/png')

    if (mode === 'download') {
      // Download the image
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${currentName}.${imageExtension}`
      link.click()
      toastNotice('Image downloaded.')
    } else if (mode === 'clipboard') {
      // Copy the image to the clipboard
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const clipboardItem = new ClipboardItem({ 'image/png': blob })
          toastNotice('Image copied to clipboard.')
          return navigator.clipboard.write([clipboardItem])
        })
        .then(() => {
          console.log('Quadrant of image copied to clipboard successfully.')
        })
        .catch(err => {
          console.error('Failed to copy quadrant of image to clipboard:', err)
        })
    }
  }

  const startEditing = () => (isEditing = true)

  const stopEditing = event => {
    updateRootnameStore(index, event.target.textContent)
    isEditing = false
  }

  const toggleFullscreen = () => {
    isFullscreen = !isFullscreen
    dispatch('fullscreenChange', isFullscreen)
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
  const downloadHandler = mode => downloadQuadrant(mode)
</script>

<div class="image-action">
  <div class="filename-area">
    {#if isEditing}
      <div class="filename-text editing" bind:this={editableDiv} bind:textContent={currentName} on:blur={handleExit} on:keydown={handleExit} on:click|stopPropagation contenteditable>
        {currentName}
      </div>
    {:else}
      <div class="filename-text">{currentName}</div>
    {/if}
    <button class="filename-edit" on:click={startEditing}>Edit</button>
  </div>
  <button on:click={() => downloadHandler('download')}>Download</button>
  <button on:click={() => downloadHandler('clipboard')}>Copy to Clipboard</button>
  <button class={`isolate-control ${isFullscreen ? 'icon-shrink' : 'icon-expand'}`} on:click={toggleFullscreen}>
    <label class="tooltip">
      {isFullscreen ? 'Maximise' : 'Minimize'}
    </label>
  </button>
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
    bottom: 2rem;
  }

  .icon-shrink {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxsaW5lIHgxPSIzOS45OTkiIHkxPSIyNC4wMDEiIHgyPSI1Ni43MzIiIHkyPSI3LjI2OCIgc3R5bGU9ImZpbGw6I2ZmZjsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjUyLjI2NiAyNC4wMDEgMzkuOTk5IDI0LjAwMSAzOS45OTkgMTEuNzM0IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjxsaW5lIHgxPSIyNC4wMDEiIHkxPSIyNC4wMDEiIHgyPSI3LjI2OCIgeTI9IjcuMjY4IiBzdHlsZT0iZmlsbDojZmZmOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6Ni41cHg7Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjQuMDAxIDExLjczNCAyNC4wMDEgMjQuMDAxIDExLjczNCAyNC4wMDEiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6Ni41cHg7Ii8+PGxpbmUgeDE9IjI0LjAwMSIgeTE9IjM5Ljk5OSIgeDI9IjcuMjY4IiB5Mj0iNTYuNzMyIiBzdHlsZT0iZmlsbDojZmZmOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6Ni41cHg7Ii8+PHBvbHlsaW5lIHBvaW50cz0iMTEuNzM0IDM5Ljk5OSAyNC4wMDEgMzkuOTk5IDI0LjAwMSA1Mi4yNjYiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6Ni41cHg7Ii8+PGxpbmUgeDE9IjM5Ljk5OSIgeTE9IjM5Ljk5OSIgeDI9IjU2LjczMiIgeTI9IjU2LjczMiIgc3R5bGU9ImZpbGw6I2ZmZjsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjM5Ljk5OSA1Mi4yNjYgMzkuOTk5IDM5Ljk5OSA1Mi4yNjYgMzkuOTk5IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjwvc3ZnPg==');
  }
  .icon-expand {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxsaW5lIHgxPSI1NS43MzIiIHkxPSI4LjI2OCIgeDI9IjM4Ljk5OSIgeTI9IjI1LjAwMSIgc3R5bGU9ImZpbGw6I2ZmZjsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjQzLjQ2NSA4LjI2OCA1NS43MzIgOC4yNjggNTUuNzMyIDIwLjUzNSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo2LjVweDsiLz48bGluZSB4MT0iOC4yNjgiIHkxPSI4LjI2OCIgeDI9IjI1LjAwMSIgeTI9IjI1LjAwMSIgc3R5bGU9ImZpbGw6I2ZmZjsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjxwb2x5bGluZSBwb2ludHM9IjguMjY4IDIwLjUzNSA4LjI2OCA4LjI2OCAyMC41MzUgOC4yNjgiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLWxpbmVqb2luOnJvdW5kOyBzdHJva2Utd2lkdGg6Ni41cHg7Ii8+PGxpbmUgeDE9IjguMjY4IiB5MT0iNTUuNzMyIiB4Mj0iMjUuMDAxIiB5Mj0iMzguOTk5IiBzdHlsZT0iZmlsbDojZmZmOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6Ni41cHg7Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjAuNTM1IDU1LjczMiA4LjI2OCA1NS43MzIgOC4yNjggNDMuNDY1IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6I2ZmZjsgc3Ryb2tlLWxpbmVjYXA6cm91bmQ7IHN0cm9rZS1saW5lam9pbjpyb3VuZDsgc3Ryb2tlLXdpZHRoOjYuNXB4OyIvPjxsaW5lIHgxPSI1NS43MzIiIHkxPSI1NS43MzIiIHgyPSIzOC45OTkiIHkyPSIzOC45OTkiIHN0eWxlPSJmaWxsOiNmZmY7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpyb3VuZDsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7IHN0cm9rZS13aWR0aDo2LjVweDsiLz48cG9seWxpbmUgcG9pbnRzPSI1NS43MzIgNDMuNDY1IDU1LjczMiA1NS43MzIgNDMuNDY1IDU1LjczMiIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnJvdW5kOyBzdHJva2UtbGluZWpvaW46cm91bmQ7IHN0cm9rZS13aWR0aDo2LjVweDsiLz48L3N2Zz4=');
  }

  .icon-expand,
  .icon-shrink {
    visibility: hidden;
    width: 2rem;
    height: 2rem;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    transition: opacity 0.4s ease-in-out;
    opacity: 0;
  }
  :global(.active) .icon-expand,
  :global(.active) .icon-shrink {
    visibility: visible;
    opacity: 1;
  }
</style>
