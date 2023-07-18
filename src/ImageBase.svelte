<script>
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
  import { rootnames, trimInfo, isTransitioning, lastHovered, params, sourceImage } from './stores.js'
  import ImageAction from './ImageAction.svelte'
  import KeyEventDispatcher from './KeyEventsDispatcher.svelte'

  export let imageUrl
  export let currentIndex

  let isLoading = true
  let imageWidth
  let imageHeight
  let fullCanvas
  let canvasContainer
  let expanded = false
  let aspectRatioCSS = ''
  let frameSpecs
  $: imageExtension = $sourceImage.extension
  $: mode = $params.mode
  $: index = $trimInfo.index
  $: expanded = $trimInfo.expanded

  onMount(async () => {
    const imageObj = await instantiateImageProps(imageUrl)
    sourceImage.update(state => ({ ...state, width: imageObj.width, height: imageObj.height }))
    frameSpecs = {
      width: imageObj.width,
      height: imageObj.height,
      x1: 0,
      y1: 0,
      factor: 1
    }
    imageWidth = imageObj.width
    imageHeight = imageObj.height
    fullCanvas = imageObj.canvas
    aspectRatioCSS = getAspectRatio(imageWidth, imageHeight)
  })
  afterUpdate(() => {
    if (fullCanvas && canvasContainer && mode === 'whole') {
      canvasContainer.appendChild(fullCanvas)
    }
  })
  // const indexSwitch = index => {
  //   if (expanded) return
  //   currentIndex = index
  //   trimInfo.update(state => ({ ...state, index: index }))
  // }
  // const switchQuadrantHandler = e => indexSwitch(e.detail.index)

  const transitionStart = e => {
    if (e.target === e.currentTarget) {
      isTransitioning.set(true)
    }
  }
  const transitionEnd = e => {
    if (e.target === e.currentTarget) {
      isTransitioning.set(false)
      if ($lastHovered && $lastHovered !== currentIndex) indexSwitch($lastHovered)
    }
  }
  const getImageRef = async url => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Enable CORS for the image request
    img.src = url
    await img.decode()
    return img
  }
  const instantiateImageProps = async url => {
    isLoading = true
    let width
    let height
    let canvas

    try {
      const start = performance.now() // Start timer
      const img = await getImageRef(url)
      const end = performance.now() // End timer
      const timeTaken = ((end - start) / 1000).toFixed(2) // Time in fractional seconds
      width = img.width
      height = img.height
      canvas = getFullCanvas(img, 0, 0, width, height)
      return { width, height, canvas }
    } catch (error) {
      console.error('Error getting image dimensions:', error)
    } finally {
      isLoading = false
    }
  }
  const dispatch = createEventDispatcher()
  const getAspectRatio = (width, height) => {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(width, height)
    const aspectWidth = width / divisor
    const aspectHeight = height / divisor
    return `aspect-ratio: ${aspectWidth} / ${aspectHeight};`
  }
  const getFullCanvas = (img, x, y, width, height) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    return canvas
  }
  const clipCoords = (index, offX, offY) => {
    let sx, sy
    switch (index) {
      case 1:
        sx = 0
        sy = 0
        break
      case 2:
        sx = offX
        sy = 0
        break
      case 3:
        sx = 0
        sy = offY
        break
      case 4:
        sx = offX
        sy = offY
        break
      default:
        // Whole image
        sx = 0
        sy = 0
    }
    return { sx, sy }
  }
  const processQuadImage = (action = 'download', index) => {
    const saveAreaWidth = parseInt(index) === 0 ? imageWidth : imageWidth / 2
    const saveAreaHeight = parseInt(index) === 0 ? imageHeight : imageHeight / 2
    const saveAreaCanvas = document.createElement('canvas')
    const saveAreaCtx = saveAreaCanvas.getContext('2d')
    saveAreaCanvas.width = saveAreaWidth
    saveAreaCanvas.height = saveAreaHeight
    let { sx, sy } = clipCoords(index, saveAreaWidth, saveAreaHeight)
    saveAreaCtx.drawImage(fullCanvas, sx, sy, saveAreaWidth, saveAreaHeight, 0, 0, saveAreaWidth, saveAreaHeight)
    const dataUrl = saveAreaCanvas.toDataURL('image/png')

    // Perform the desired action based on the specified "action" parameter
    switch (action) {
      case 'download':
        saveImage(dataUrl, $rootnames[index], imageExtension)
        dispatch('toastNotice', `Quadrant ${index} downloading.`)
        break
      case 'clipboard':
        copyImageToClipboard(dataUrl)
        break
      case 'background':
        return dataUrl
        break
      default:
        console.error('Invalid action specified. Please use a valid action such as "download", "clipboard", or "background".')
        break
    }
  }
  const downloadCanvasAsFile = (canvas, currentName, imageExtension) => {
    const dataUrl = canvas.toDataURL(`image/${imageExtension}`, 0.95)
    saveImage(dataUrl, currentName, imageExtension)
  }
  const saveImage = (dataUrl, currentName, imageExtension) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${currentName}${imageExtension}`
    link.click()
  }
  const copyCanvasToClipboard = canvas => {
    canvas.toBlob(blob => {
      const clipboardItem = new ClipboardItem({ 'image/png': blob })
      return navigator.clipboard.write([clipboardItem])
    })
  }
  const copyImageToClipboard = dataUrl => {
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const clipboardItem = new ClipboardItem({ 'image/png': blob })
        dispatch('toastNotice', `Quadrant ${currentIndex} copied to clipboard.`)
        return navigator.clipboard.write([clipboardItem])
      })
      .then(() => {
        console.log('Quadrant of image copied to clipboard successfully.')
      })
      .catch(err => {
        console.error('Failed to copy quadrant of image to clipboard:', err)
      })
  }
  const trimCanvas = (canvas, trimInfo) => {
    const trimCanvasEl = document.createElement('canvas')
    const trimCtx = trimCanvasEl.getContext('2d')
    trimCanvasEl.width = trimInfo.width
    trimCanvasEl.height = trimInfo.height
    trimCtx.drawImage(canvas, trimInfo.x, trimInfo.y, trimInfo.width, trimInfo.height, 0, 0, trimInfo.width, trimInfo.height)
    return trimCanvasEl
  }
  const imageActionHandler = action => {
    if (action === 'downloadall') {
      ;[4, 3, 2, 1].forEach(idx => processQuadImage('download', idx))
      return
    }
    if (mode === 'quadrant' && !$trimInfo.isDefined) {
      processQuadImage(action, $trimInfo.index)
    } else {
      const downloadCanvas = $trimInfo.isDefined ? trimCanvas(fullCanvas, $trimInfo) : fullCanvas
      if (action === 'download') {
        downloadCanvasAsFile(downloadCanvas, $rootnames[currentIndex], imageExtension)
        dispatch('toastNotice', $trimInfo.isDefined ? `Trim area downloading.` : 'Full image downloading.')
      } else if (action === 'clipboard') {
        copyCanvasToClipboard(downloadCanvas)
        dispatch('toastNotice', $trimInfo.isDefined ? `Trim area copied to clipboard` : 'Full image copied to clipboard.')
      }
    }
  }
  const quadOffsets = index => {
    const offX = parseInt(index) === 1 || parseInt(index) === 3 ? 0 : imageWidth / 2
    const offY = parseInt(index) === 1 || parseInt(index) === 2 ? 0 : imageHeight / 2
    return { x1: offX, y1: offY }
  }
  const expandHandler = () => {
    trimInfo.update(state => ({ ...state, expanded: !state.expanded }))
  }

  const switchHandler = index => {
    if ($isTransitioning) {
      lastHovered.set(index)
    } else {
      indexSwitch(index)
    }
  }

  const indexSwitch = index => {
    if (expanded) return
    currentIndex = index
    trimInfo.update(state => ({ ...state, index: index }))
  }

  const switchQuadrantHandler = e => indexSwitch(e.detail.index)
  const copyClipboardHandler = e => imageActionHandler('clipboard')
  const downloadFileHandler = e => imageActionHandler('download')
  const downloadAllHandler = e => imageActionHandler('downloadall')
</script>

<KeyEventDispatcher on:downloadfile={downloadFileHandler} on:downloadall={downloadAllHandler} on:copytoclipboard={copyClipboardHandler} on:switchquadrant={switchQuadrantHandler} on:expandaction={() => expandHandler()} />
{#if isLoading}
  <div class="spinner-container">
    <div class="spinner">Loading...</div>
  </div>
{:else if imageWidth && imageHeight}
  <div class="image-base">
    <div class="image-shim" class:quadrant-padding={mode === 'quadrant'} style={`${aspectRatioCSS}`}>
      <div class="image-tracker" class:expanded class:quadrants={mode === 'quadrant'}>
        {#if mode === 'quadrant'}
          {#each [1, 2, 3, 4] as index}
            <div style={`background-image:url(${imageUrl});${aspectRatioCSS}`} class:active={currentIndex === index} class={`${mode} quadrant-${index}`} on:mouseenter={() => switchHandler(index)} on:transitionstart={transitionStart} on:transitionend={transitionEnd}>
              <div bind:this={canvasContainer} />
              <ImageAction {index} frameSpecs={{ ...frameSpecs, ...quadOffsets(index), factor: 0.5 }} on:expandaction={() => expandHandler()} on:imageaction={e => imageActionHandler(e.detail)} />
            </div>
          {/each}
        {:else}
          <div class="whole active" style={`background-image:url(${imageUrl});${aspectRatioCSS}`} on:mouseenter={() => indexSwitch(index)}>
            <ImageAction {index} {frameSpecs} on:imageaction={e => imageActionHandler(e.detail)} />
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div>
    <p>Error loading image dimensions.</p>
  </div>
{/if}

<style>
  .image-shim {
    position: relative;
    margin-left: auto;
    margin-right: auto;
    max-width: 100vw;
    max-height: 100vh;
    transition: all 0.375s ease-in-out;
  }
  .image-shim.quadrant-padding {
    /* transition: all 0.5s ease-in-out; */
    max-width: calc(100vw - 2 * var(--quadgap));
    max-height: calc(100vh - 2 * var(--quadgap));
  }
  .image-tracker {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }
  .quadrant,
  .whole {
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    transition: all 0.12s ease-in-out;
    box-shadow: 0.75rem 0.75rem 1.5rem black;
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
    aspect-ratio: 1/1;
    background-size: 100%;
    background-repeat: no-repeat;
  }
  .quadrants .quadrant {
    width: 50%;
    height: 50%;
    margin: 0;
    position: absolute;
    background-size: 200%;
    transition: top 0.375s ease-in-out, bottom 0.375s ease-in-out, left 0.375s ease-in-out, right 0.375s ease-in-out, margin 0.375s ease-in-out, width 0.375s ease-in-out, height 0.375s ease-in-out, opacity 0.375s ease-in-out, z-index 0s ease-in-out, background-position 0.375s ease-in-out;
    transition-delay: 0s, 0s, 0s, 0s, 0s, 0s, 0s, 0.5s, 0.5s, 0s;
    z-index: 0;
  }
  .quadrant:first-child {
    top: 0;
    left: 0;
    margin: calc(var(--quadgap) * -1) 0 0 calc(var(--quadgap) * -1);
    transform: translate(calc(var(--quadgap) * -1), calc(var(--quadgap) * -1));
    animation: quad-1 0.75s forwards;
  }
  .quadrant:nth-child(2) {
    top: 0;
    right: 0;
    margin: calc(var(--quadgap) * -1) calc(var(--quadgap) * -1) 0 0;
    background-position: 100% 0;
    animation: quad-2 0.75s forwards;
  }
  .quadrant:nth-child(3) {
    bottom: 0;
    left: 0;
    margin: 0 0 calc(var(--quadgap) * -1) calc(var(--quadgap) * -1);
    background-position: 100% 0;
    background-position: 0% 100%;
    animation: quad-3 0.75s forwards;
  }
  .quadrant:nth-child(4) {
    bottom: 0;
    right: 0;
    margin: 0 calc(var(--quadgap) * -1) calc(var(--quadgap) * -1) 0;
    background-position: 100% 100%;
    animation: quad-4 0.75s forwards;
  }

  @keyframes quad-1 {
    0% {
      transform: translate(var(--quadgap), var(--quadgap));
    }
    100% {
      transform: translate(0, 0);
    }
  }
  @keyframes quad-2 {
    0% {
      transform: translate(calc(var(--quadgap) * -1), calc(var(--quadgap) * 1));
    }
    100% {
      transform: translate(0, 0);
    }
  }
  @keyframes quad-3 {
    0% {
      transform: translate(var(--quadgap), calc(var(--quadgap) * -1));
    }
    100% {
      transform: translate(0, 0);
    }
  }
  @keyframes quad-4 {
    0% {
      transform: translate(calc(var(--quadgap) * -1), calc(var(--quadgap) * -1));
    }
    100% {
      transform: translate(0, 0);
    }
  }

  .quadrant:first-child :global(.controls-wrapper),
  .quadrant:nth-child(3) :global(.controls-wrapper) {
    left: auto;
    right: 0;
  }
  .whole :global(.controls-wrapper),
  .quadrants.expanded .quadrant :global(.controls-wrapper) {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }

  .quadrants.expanded .quadrant {
    width: 0;
    opacity: 0;
    transition: margin 0.75s ease-in-out, width 0.75s ease-in-out, height 0.75s ease-in-out, opacity 0.5s ease-in-out, z-index 0s ease-in-out;
    transition-delay: 0.375s, 0.375s, 0.375s, 0s, 0s;
  }
  .quadrants.expanded .quadrant.active {
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 1;
  }

  .spinner-container {
    position: fixed;
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
  }
  .spinner {
    position: relative;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--fonts);
    font-size: 0.9rem;
  }
  .spinner:after {
    position: absolute;
    content: '';
    border: 5px solid #f3f3f3;
    border-radius: 50%;
    border-top-color: #c72035;
    border-right-color: #f7903e;
    border-bottom-color: #f05872;
    border-left-color: #faaa42;
    width: 10vw;
    height: 10vw;
    min-width: 98px;
    min-height: 98px;
    animation: spin 4s linear infinite;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
