<script>
  import { onMount, onDestroy } from 'svelte'
  import { cropinfo } from './stores'
  export let frameSpecs

  let svg, svgRect, focusOverlay, cropStats, rectObj
  let moveHandle
  let imageWidth = frameSpecs.width
  let imageHeight = frameSpecs.height
  let quadOffsetX = frameSpecs.x1
  let quadOffsetY = frameSpecs.y1
  let factor = frameSpecs.factor
  let rectState = { x: 0, y: 0, width: 0, height: 0 }

  let drawing = false
  let resizing = false
  let moving = false

  let currentHandle
  let offsetX, offsetY, screenOffsetX, screenOffsetY
  let relativeRectState = { x: quadOffsetX, y: quadOffsetY, width: imageWidth, height: imageHeight }
  let isFrameInUse = false

  const focusOverlayName = 'focusOverlay'
  const movehandleName = 'movehandle'
  const handles = [
    { id: 'top-left', cursor: 'nw-resize' },
    { id: 'top-right', cursor: 'ne-resize' },
    { id: 'bottom-left', cursor: 'sw-resize' },
    { id: 'bottom-right', cursor: 'se-resize' }
  ]
  const handleSize = 14
  $: {
    if (svg) {
      relativeRectState = {
        x: Math.floor((rectState.x / svg.clientWidth) * imageWidth * factor) + quadOffsetX,
        y: Math.floor((rectState.y / svg.clientHeight) * imageHeight * factor) + quadOffsetY,
        width: Math.floor((rectState.width / svg.clientWidth) * imageWidth * factor),
        height: Math.floor((rectState.height / svg.clientHeight) * imageHeight * factor)
      }
    }
  }
  onMount(() => {
    svg.addEventListener('mousedown', onMouseDown)
    svg.addEventListener('mousemove', onMouseMove)
    svg.addEventListener('mouseup', onMouseUp)
    svg.addEventListener('mouseenter', onMouseLeave)
    svg.addEventListener('mouseenter', addKeyListener)
    svg.addEventListener('mouseleave', onMouseLeave)
    svg.addEventListener('mouseleave', removeKeyListener)
    document.addEventListener('mouseup', onMouseUp)
    handles.forEach(h => {
      h.ref = document.querySelector(`svg #${h.id}`)
    })
    moveHandle = document.querySelector(`svg #${movehandleName}`)
    focusOverlay = document.querySelector(`svg #${focusOverlayName}`)
    focusOverlay.addEventListener('click', resetSVG)
  })
  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  const addKeyListener = () => document.addEventListener('keydown', handleKeydown)
  const removeKeyListener = () => document.removeEventListener('keydown', handleKeydown)

  function handleKeydown(event) {
    if (!canIgnoreKeydown()) {
      // allow key events because user is not editing text
      if (event.key === 'Escape') $cropinfo.cancelCrop = true
    }
  }

  function canIgnoreKeydown() {
    const ae = document.activeElement
    const cannotIgnore = ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.tagName === 'FORM' || ae.contentEditable === 'true'
    return cannotIgnore
  }

  function onMouseDown(event) {
    svgRect = svg.getBoundingClientRect()
    screenOffsetX = svgRect.left
    screenOffsetY = svgRect.top
    if (event.target === svg) {
      offsetX = event.clientX - screenOffsetX
      offsetY = event.clientY - screenOffsetY
      drawing = true
      svg.classList.remove('inactive')
      rectState = { x: 0, y: 0, width: 0, height: 0 }
      focusOverlay.setAttribute('d', `M0,0H${svgRect.width}V${svgRect.height}H0Z`)
    } else if (event.target.classList.contains('handle')) {
      offsetX = event.clientX - screenOffsetX
      offsetY = event.clientY - screenOffsetY
      resizing = true
      currentHandle = event.target
    } else if (event.target.id === 'movehandle') {
      offsetX = event.clientX - rectState.x
      offsetY = event.clientY - rectState.y
      moving = true
    }
    cropinfo.update(state => ({ ...state, cropinprogress: true }))
  }
  function onMouseMove(e) {
    let newX, newY, newWidth, newHeight
    if (drawing) {
      newX = Math.min(offsetX, e.clientX - screenOffsetX)
      newY = Math.min(offsetY, e.clientY - screenOffsetY)
      newWidth = Math.abs(offsetX - e.clientX + screenOffsetX)
      newHeight = Math.abs(offsetY - e.clientY + screenOffsetY)
    } else if (resizing) {
      const r = rectState
      newX = rectState.x
      newY = rectState.y
      newWidth = rectState.width
      newHeight = rectState.height
      switch (currentHandle.id) {
        case 'top-left':
          newX = Math.min(e.clientX - screenOffsetX, r.x + r.width)
          newY = Math.min(e.clientY - screenOffsetY, r.y + r.height)
          newWidth = Math.abs(r.x + r.width - newX)
          newHeight = Math.abs(r.y + r.height - newY)
          break
        case 'top-right':
          newY = Math.min(e.clientY - screenOffsetY, r.y + r.height)
          newWidth = Math.abs(e.clientX - screenOffsetX - r.x)
          newHeight = Math.abs(r.y + r.height - newY)
          break
        case 'bottom-left':
          newX = Math.min(e.clientX - screenOffsetX, r.x + r.width)
          newWidth = Math.abs(r.x + r.width - newX)
          newHeight = Math.abs(e.clientY - screenOffsetY - r.y)
          break
        case 'bottom-right':
          newWidth = Math.abs(e.clientX - screenOffsetX - r.x)
          newHeight = Math.abs(e.clientY - screenOffsetY - r.y)
          break
      }
    } else if (moving) {
      newX = Math.min(Math.max(0, e.clientX - offsetX), svgRect.width - rectState.width)
      newY = Math.min(Math.max(0, e.clientY - offsetY), svgRect.height - rectState.height)
      newWidth = rectState.width
      newHeight = rectState.height
    }
    if (drawing || resizing || moving) {
      updateFrameArea(newX, newY, newWidth, newHeight)
      updateCropStatsPanel(newX + newWidth / 2, newY + newHeight / 2)
      rectState = { x: newX, y: newY, width: newWidth, height: newHeight }
    }
  }
  function onMouseUp() {
    drawing = false
    resizing = false
    moving = false
    isFrameInUse = rectState.width && rectState.height ? true : false
    if (isFrameInUse) cropinfo.update(state => ({ ...state, ...relativeRectState }))
    cropinfo.update(state => ({ ...state, isDefined: isFrameInUse, cropinprogress: false }))
  }
  function onMouseLeave(event) {
    if (drawing || resizing) {
      const svgRect = svg.getBoundingClientRect()
      let newX = rectState.x
      let newY = rectState.y
      let newWidth = rectState.width
      let newHeight = rectState.height

      if (event.clientX > svgRect.right) {
        newWidth = svgRect.width - newX
      }
      if (event.clientY > svgRect.bottom) {
        newHeight = svgRect.height - newY
      }
      updateFrameArea(newX, newY, newWidth, newHeight)
      rectState = { x: newX, y: newY, width: newWidth, height: newHeight }
    }
  }
  function updateCropStatsPanel(x, y) {
    cropStats.style.left = `${x}px`
    cropStats.style.top = `${y}px`
  }
  function updateFrameArea(x, y, width, height) {
    rectObj.setAttribute('x', x)
    rectObj.setAttribute('y', y)
    rectObj.setAttribute('width', width)
    rectObj.setAttribute('height', height)
    moveHandle.setAttribute('x', x)
    moveHandle.setAttribute('y', y)
    moveHandle.setAttribute('width', width)
    moveHandle.setAttribute('height', height)
    handles.forEach(handle => {
      const r = handle.ref
      switch (handle.id) {
        case 'top-left':
          r.setAttribute('x', x)
          r.setAttribute('y', y)
          break
        case 'top-right':
          r.setAttribute('x', x + width)
          r.setAttribute('y', y)
          break
        case 'bottom-left':
          r.setAttribute('x', x)
          r.setAttribute('y', y + height)
          break
        case 'bottom-right':
          r.setAttribute('x', x + width)
          r.setAttribute('y', y + height)
          break
      }
    })
    focusOverlay.setAttribute('d', `M0,0H${svgRect.width}V${svgRect.height}H0ZM${x},${y}H${x + width}V${y + height}H${x}Z`)
  }
  function resetSVG() {
    isFrameInUse = false
    $cropinfo.isDefined = false
    $cropinfo.cancelCrop = true
    updateFrameArea(-100, -100, 0, 0)
    handles.forEach(handle => {
      handle.ref.setAttribute('x', -100)
      handle.ref.setAttribute('y', -100)
    })
    focusOverlay.setAttribute('d', 'M-100,-100H0V0H-100ZM-100,-100H0V0H-100Z')
  }
</script>

<div class="crop-stage">
  <!-- <p style="position:absolute;color:white;text-shadow:2px 2px 4px black,2px 2px 12px black,2px 2px 12px black,2px 2px 12px black,2px 2px 12px black,2px 2px 12px black,2px 2px 12px black,2px 2px 12px black,2px 2px 12px black;">frameSpecs: {JSON.stringify(frameSpecs)}<br />relRect: {JSON.stringify(relativeRectState)}</p> -->
  <div bind:this={cropStats} class="crop-stats-container">
    {#if isFrameInUse || drawing || moving || resizing}
      <div class="crop-stats">
        <p><span>x:</span>{Math.floor(rectState.x)}</p>
        <p><span>y:</span>{Math.floor(rectState.y)}</p>
        <p><span>w:</span>{Math.floor(rectState.width)}</p>
        <p><span>h:</span>{Math.floor(rectState.height)}</p>
      </div>
    {/if}
  </div>
  <svg bind:this={svg} width="100%" height="100%" class="inactive">
    <defs>
      <rect bind:this={rectObj} vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision" id="bbox" x="0" y="0" width="0" height="0" />
      <clipPath id="insideStrokeOnly">
        <use xlink:href="#bbox" />
      </clipPath>
    </defs>
    <use xlink:href="#bbox" stroke-width="2px" stroke="white" fill="none" clip-path="url(#insideStrokeOnly)" />
    <use xlink:href="#bbox" stroke-width="2px" stroke-dasharray="2,2" stroke="#777" fill="none" clip-path="url(#insideStrokeOnly)" />
    <path id={focusOverlayName} bind:this={focusOverlay} fill="#000" d="M-100,-100H0V0H-100ZM-100,-100H0V0H-100Z" fill-rule="evenodd" opacity="0.5" />
    <rect id={movehandleName} x="-100" y="-100" width="0" height="0" style="cursor:grab;" fill="transparent" />
    {#each handles as handle}
      <rect class="handle" id={handle.id} x="-100" y="-100" width={handleSize} height={handleSize} style="cursor: {handle.cursor};" rx={handleSize / 2} ry={handleSize / 2} />
    {/each}
  </svg>
</div>

<style>
  svg {
    /* transition: background-color 0.2s ease-in-out; */
  }
  svg.inactive {
    background-color: rgba(0, 0, 0, 0.75);
    /* transition: background-color 0.1s; */
  }
  .crop-stage {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .crop-stats-container {
    position: absolute;
    width: 0;
    height: 0;
    overflow: visible;
    /* border: 1px solid blue; */
  }
  .crop-stats {
    position: absolute;
    display: grid;
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.75);
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    gap: 0.4375rem;
    row-gap: 0.5rem;
    border-radius: 0.5rem;
  }
  .crop-stats p {
    white-space: nowrap;
    color: white;
    line-height: 0.75;
    margin: 0;
    text-transform: uppercase;
  }
  .crop-stats span {
    opacity: 0.6;
    display: inline-block;
    width: 2ch;
    text-align: right;
    margin-right: 0.5ch;
  }
  .handle {
    box-sizing: border-box;
    fill: rgba(255, 255, 255, 0.2);
    stroke: white;
    stroke-weight: 1px;
    opacity: 0.9;
    transform: translate(-7px, -7px);
  }
  .handle:hover {
    fill: rgba(255, 255, 255, 0.5);
  }
  svg {
    cursor: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIuMDkxIiB4Mj0iMTIiIHkyPSI3Ljk5MSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnNxdWFyZTsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7IHN0cm9rZS13aWR0aDozcHg7Ii8+PGxpbmUgeDE9IjEyIiB5MT0iMi4wOTEiIHgyPSIxMiIgeTI9IjcuOTkxIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IzIzMWYyMDsgc3Ryb2tlLWxpbmVjYXA6c3F1YXJlOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsiLz48bGluZSB4MT0iMi4wOTEiIHkxPSIxMiIgeDI9IjcuOTkxIiB5Mj0iMTIiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpzcXVhcmU7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6M3B4OyIvPjxsaW5lIHgxPSIyLjA5MSIgeTE9IjEyIiB4Mj0iNy45OTEiIHkyPSIxMiIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiMyMzFmMjA7IHN0cm9rZS1saW5lY2FwOnNxdWFyZTsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7Ii8+PGxpbmUgeDE9IjEyIiB5MT0iMjEuOTA5IiB4Mj0iMTIiIHkyPSIxNi4wMDkiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpzcXVhcmU7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6M3B4OyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIxLjkwOSIgeDI9IjEyIiB5Mj0iMTYuMDA5IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IzIzMWYyMDsgc3Ryb2tlLWxpbmVjYXA6c3F1YXJlOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsiLz48bGluZSB4MT0iMjEuOTA5IiB5MT0iMTIiIHgyPSIxNi4wMDkiIHkyPSIxMiIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnNxdWFyZTsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7IHN0cm9rZS13aWR0aDozcHg7Ii8+PGxpbmUgeDE9IjIxLjkwOSIgeTE9IjEyIiB4Mj0iMTYuMDA5IiB5Mj0iMTIiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojMjMxZjIwOyBzdHJva2UtbGluZWNhcDpzcXVhcmU7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyIvPjwvc3ZnPg==') 12 11, pointer;
  }
</style>
