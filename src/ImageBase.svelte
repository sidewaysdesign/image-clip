<script>
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
  import { rootnames, cropinfo } from './stores.js'
  import ImageAction from './ImageAction.svelte'

  export let imageUrl
  export let imageExtension
  export let currentIndex
  export let mode

  let index = currentIndex

  let isLoading = true
  let imageWidth
  let imageHeight
  let fullCanvas
  let canvasContainer
  let expanded = false
  let aspectRatioCSS = ''
  let frameSpecs

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
      const img = await getImageRef(url)
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
  onMount(async () => {
    const imageObj = await instantiateImageProps(imageUrl)
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
  const processImage = (action = 'download', index) => {
    const saveAreaWidth = parseInt(index) === 0 ? imageWidth : imageWidth / 2
    const saveAreaHeight = parseInt(index) === 0 ? imageHeight : imageHeight / 2
    const saveAreaCanvas = document.createElement('canvas')
    const saveAreaCtx = saveAreaCanvas.getContext('2d')
    saveAreaCanvas.width = saveAreaWidth
    saveAreaCanvas.height = saveAreaHeight
    let { sx, sy } = clipCoords(index, saveAreaWidth, saveAreaHeight)
    console.log(saveAreaWidth)
    saveAreaCtx.drawImage(fullCanvas, sx, sy, saveAreaWidth, saveAreaHeight, 0, 0, saveAreaWidth, saveAreaHeight)
    const dataUrl = saveAreaCanvas.toDataURL('image/png')

    // Perform the desired action based on the specified "action" parameter
    switch (action) {
      case 'download':
        saveImage(dataUrl, $rootnames[currentIndex], imageExtension)
        dispatch('toastNotice', 'Image quadrant downloaded.')
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
    const dataUrl = canvas.toDataURL(`image/${imageExtension}`)
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
        dispatch('toastNotice', 'Quadrant copied to clipboard.')
        return navigator.clipboard.write([clipboardItem])
      })
      .then(() => {
        console.log('Quadrant of image copied to clipboard successfully.')
      })
      .catch(err => {
        console.error('Failed to copy quadrant of image to clipboard:', err)
      })
  }
  const cropCanvas = (canvas, cropinfo) => {
    const cropCanvas = document.createElement('canvas')
    const cropCtx = cropCanvas.getContext('2d')
    cropCanvas.width = cropinfo.width
    cropCanvas.height = cropinfo.height
    cropCtx.drawImage(canvas, cropinfo.x, cropinfo.y, cropinfo.width, cropinfo.height, 0, 0, cropinfo.width, cropinfo.height)
    return cropCanvas
  }
  const imageActionHandler = action => {
    if (mode === 'quadrant' && !$cropinfo.isDefined) {
      processImage(action, currentIndex)
    } else {
      // console.log('ImageBase $cropinfo: ', JSON.parse(JSON.stringify($cropinfo)))
      const downloadCanvas = $cropinfo.isDefined ? cropCanvas(fullCanvas, $cropinfo) : fullCanvas
      if (action === 'download') {
        console.log('$cropinfo.isDefined: ', $cropinfo.isDefined)
        downloadCanvasAsFile(downloadCanvas, $rootnames[index], imageExtension)
        dispatch('toastNotice', $cropinfo.isDefined ? 'Crop area downloading.' : 'Full image downloading.')
      } else if (action === 'clipboard') {
        copyCanvasToClipboard(downloadCanvas)
        dispatch('toastNotice', $cropinfo.isDefined ? 'Crop area copied to clipboard' : 'Full image copied to clipboard.')
      }
    }
  }
  const quadOffsets = index => {
    const offX = parseInt(index) === 1 || parseInt(index) === 3 ? 0 : imageWidth / 2
    const offY = parseInt(index) === 1 || parseInt(index) === 2 ? 0 : imageHeight / 2
    return { x1: offX, y1: offY }
  }
</script>

{#if isLoading}
  <div class="spinner-container">
    <div class="spinner" />
  </div>
{:else if imageWidth && imageHeight}
  <div class="image-base">
    <div class="image-shim" style={`${aspectRatioCSS}`}>
      <div class="image-tracker" class:expanded class:quadrants={mode === 'quadrant'}>
        {#if mode === 'quadrant'}
          {#each [1, 2, 3, 4] as index}
            <div style={`background-image:url(${imageUrl});${aspectRatioCSS}`} class:active={currentIndex === index} class={mode} on:mouseenter={() => (currentIndex = index)}>
              <div bind:this={canvasContainer} />
              <ImageAction {mode} {index} frameSpecs={{ ...frameSpecs, ...quadOffsets(index), factor: 0.5 }} on:expandaction={() => (expanded = !expanded)} on:imageaction={e => imageActionHandler(e.detail)} />
            </div>
          {/each}
        {:else}
          <div class="whole active" style={`background-image:url(${imageUrl});${aspectRatioCSS}`}>
            <ImageAction {mode} {index} {frameSpecs} on:imageaction={e => imageActionHandler(e.detail)} />
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
  .image-base {
    /* position: relative; */
  }
  .image-shim {
    position: relative;
    margin-left: auto;
    margin-right: auto;
    max-width: 100vw;
    max-height: 100vh;
  }
  .image-tracker {
    display: block;
    position: absolute;
    min-width: 20rem;
    min-height: 20rem;
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
    width: calc(50% - var(--quadgap));
    height: calc(50% - var(--quadgap));
    margin: 0;
    position: absolute;
    background-size: 200%;
    transition: margin 0.5s ease-in-out, width 0.5s ease-in-out, height 0.5s ease-in-out, opacity 0.375s ease-in-out, z-index 0s ease-in-out;
    transition-delay: 0s, 0s, 0s, 0.5s, 0.5s;
    z-index: 0;
  }
  .quadrant:first-child {
    top: 0;
    left: 0;
    margin-right: var(--quadgap);
    margin-bottom: var(--quadgap);
  }
  .quadrant:nth-child(2) {
    top: 0;
    right: 0;
    margin-left: var(--quadgap);
    margin-bottom: var(--quadgap);
    background-position: 100% 0;
  }
  .quadrant:nth-child(3) {
    bottom: 0;
    left: 0;
    margin-right: var(--quadgap);
    margin-top: var(--quadgap);
    background-position: 0% 100%;
  }
  .quadrant:nth-child(4) {
    bottom: 0;
    right: 0;
    margin-left: var(--quadgap);
    margin-top: var(--quadgap);
    background-position: 100% 100%;
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
  .whole .background-container {
    border: 15px solid orange;
    background-size: 100%;
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
  }
  .spinner-container {
    display: block;
    width: 100vw;
    height: 100vh;
  }
  .spinner {
    border: 4px solid #f3f3f3;
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
  }
  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  canvas {
    box-shadow: 0.75rem 0.75rem 1.5rem black;
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
