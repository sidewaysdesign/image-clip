<script>
  import { onMount } from 'svelte'
  import { trimInfo, rectState, sourceImage } from './stores'
  export let frameSpecs

  let svg, svgRect, focusOverlay, trimStats, rectObj
  let moveHandle

  let imageWidth = frameSpecs.width
  let imageHeight = frameSpecs.height
  let quadOffsetX = frameSpecs.x1
  let quadOffsetY = frameSpecs.y1
  let factor = frameSpecs.factor

  let drawing = false
  let resizing = false
  let moving = false

  let currentHandle
  let offsetX, offsetY, screenOffsetX, screenOffsetY
  let relativeRectState = { x: quadOffsetX, y: quadOffsetY, width: imageWidth, height: imageHeight }
  let isFrameInUse = false

  let scaleX, scaleY

  const focusOverlayName = 'focusOverlay'
  const movehandleName = 'movehandle'
  const handles = [
    { id: 'top-left', cursor: 'nw-resize' },
    { id: 'top-right', cursor: 'ne-resize' },
    { id: 'bottom-left', cursor: 'sw-resize' },
    { id: 'bottom-right', cursor: 'se-resize' },
    { id: 'top-middle', cursor: 'ns-resize' },
    { id: 'bottom-middle', cursor: 'ns-resize' },
    { id: 'left-middle', cursor: 'ew-resize' },
    { id: 'right-middle', cursor: 'ew-resize' }
  ]
  const handleSize = 14

  $: {
    scaleX = svg ? svg.clientWidth / imageWidth : 1
    scaleY = svg ? svg.clientHeight / imageHeight : 1
  }

  $: {
    if (svg) {
      relativeRectState = {
        x: Math.floor($rectState.x * factor + quadOffsetX),
        y: Math.floor($rectState.y * factor + quadOffsetY),
        width: Math.floor($rectState.width * factor),
        height: Math.floor($rectState.height * factor)
      }
    }
  }

  $: if ($rectState.update) {
    let { x, y, width, height } = $rectState
    rectState.update(state => ({ ...state, update: false }))
    updatetrimStatsPosition(x * scaleX, y * scaleY, width * scaleX, height * scaleY)
    updateFrameArea(x * scaleX, y * scaleY, width * scaleX, height * scaleY)
    trimInfo.update(state => ({ ...state, x: x * factor + quadOffsetX, y: y * factor + quadOffsetY, width: width * factor, height: height * factor }))
  }

  onMount(() => {
    svg.addEventListener('mousedown', onMouseDown)
    svg.addEventListener('mousemove', onMouseMove)
    svg.addEventListener('mouseup', onMouseUp)

    handles.forEach(h => {
      h.ref = document.querySelector(`svg #${h.id}`)
    })
    moveHandle = document.querySelector(`svg #${movehandleName}`)
    focusOverlay = document.querySelector(`svg #${focusOverlayName}`)
    focusOverlay.addEventListener('click', resetSVG)
  })

  async function onMouseDown(event) {
    svgRect = svg.getBoundingClientRect()
    screenOffsetX = svgRect.left
    screenOffsetY = svgRect.top

    if (event.target === svg) {
      offsetX = (event.clientX - screenOffsetX) / scaleX
      offsetY = (event.clientY - screenOffsetY) / scaleY
      drawing = true
      svg.classList.remove('inactive')
      focusOverlay.setAttribute('d', `M0,0H${svgRect.width}V${svgRect.height}H0Z`)
    } else if (event.target.classList.contains('handle')) {
      offsetX = event.clientX - screenOffsetX
      offsetY = event.clientY - screenOffsetY
      resizing = true
      currentHandle = event.target
      currentHandle = event.target
      toggleActiveClass(true)
    } else if (event.target.id === 'movehandle') {
      offsetX = event.clientX - screenOffsetX - $rectState.x * scaleX
      offsetY = event.clientY - screenOffsetY - $rectState.y * scaleY
      moving = true
    }
    trimInfo.update(state => ({ ...state, triminprogress: true }))
    if (!moving) window.addEventListener('mousemove', onWindowMouseMove)
  }

  function onMouseMove(e) {
    let newX, newY, newWidth, newHeight

    if (drawing) {
      newX = Math.min(offsetX, (e.clientX - screenOffsetX) / scaleX)
      newY = Math.min(offsetY, (e.clientY - screenOffsetY) / scaleY)
      newWidth = Math.abs(offsetX - (e.clientX - screenOffsetX) / scaleX)
      newHeight = Math.abs(offsetY - (e.clientY - screenOffsetY) / scaleY)
    } else if (resizing) {
      const r = $rectState
      newX = r.x
      newY = r.y
      newWidth = r.width
      newHeight = r.height

      switch (currentHandle.id) {
        case 'top-left':
          newX = Math.min((e.clientX - screenOffsetX) / scaleX, r.x + r.width)
          newY = Math.min((e.clientY - screenOffsetY) / scaleY, r.y + r.height)
          newWidth = Math.abs(r.x + r.width - newX)
          newHeight = Math.abs(r.y + r.height - newY)
          break
        case 'top-right':
          newY = Math.min((e.clientY - screenOffsetY) / scaleY, r.y + r.height)
          newWidth = Math.abs(e.clientX - screenOffsetX - r.x * scaleX) / scaleX
          newHeight = Math.abs(r.y + r.height - newY)
          break
        case 'bottom-left':
          newX = Math.min((e.clientX - screenOffsetX) / scaleX, r.x + r.width)
          newWidth = Math.abs(r.x + r.width - newX)
          newHeight = Math.abs((e.clientY - screenOffsetY - r.y * scaleY) / scaleY)
          break
        case 'bottom-right':
          newWidth = Math.abs((e.clientX - screenOffsetX - r.x * scaleX) / scaleX)
          newHeight = Math.abs((e.clientY - screenOffsetY - r.y * scaleY) / scaleY)
          break
        case 'top-middle':
          newY = Math.min((e.clientY - screenOffsetY) / scaleY, r.y + r.height)
          newHeight = Math.abs(r.y + r.height - newY)
          break
        case 'bottom-middle':
          newHeight = Math.abs((e.clientY - screenOffsetY - r.y * scaleY) / scaleY)
          break
        case 'left-middle':
          newX = Math.min((e.clientX - screenOffsetX) / scaleX, r.x + r.width)
          newWidth = Math.abs(r.x + r.width - newX)
          break
        case 'right-middle':
          newWidth = Math.abs((e.clientX - screenOffsetX - r.x * scaleX) / scaleX)
          break
      }
      toggleActiveClass(true)
    } else if (moving) {
      newX = Math.min(Math.max(0, (e.clientX - screenOffsetX - offsetX) / scaleX), imageWidth - $rectState.width)
      newY = Math.min(Math.max(0, (e.clientY - screenOffsetY - offsetY) / scaleY), imageHeight - $rectState.height)
      newWidth = $rectState.width
      newHeight = $rectState.height
    }
    if (drawing || resizing || moving) {
      updateFrameArea(newX * scaleX, newY * scaleY, newWidth * scaleX, newHeight * scaleY)
      updatetrimStatsPosition(newX * scaleX, newY * scaleY, newWidth * scaleX, newHeight * scaleY)
      rectState.update(state => ({ ...state, x: newX, y: newY, width: newWidth, height: newHeight }))
    }
  }

  function onMouseUp() {
    if (!moving) window.removeEventListener('mousemove', onWindowMouseMove)
    drawing = false
    resizing = false
    moving = false
    isFrameInUse = $rectState.width && $rectState.height ? true : false
    if (isFrameInUse) trimInfo.update(state => ({ ...state, ...relativeRectState }))
    trimInfo.update(state => ({ ...state, isDefined: isFrameInUse, triminprogress: false }))
    toggleActiveClass(false)
  }
  const onWindowMouseMove = event => {
    svgRect = svg.getBoundingClientRect()

    if (event.buttons === 1) {
      let directionX = event.clientX < svgRect.left ? -1 : event.clientX > svgRect.right ? 1 : 0
      let directionY = event.clientY < svgRect.top ? -1 : event.clientY > svgRect.bottom ? 1 : 0

      if (directionX || directionY) {
        edgeTrim(directionX, directionY)
        onMouseUp()
      }
    }
  }

  const edgeTrim = (directionX, directionY) => {
    let { x, y, width, height } = $rectState
    let newX = x,
      newY = y,
      newWidth = width,
      newHeight = height

    // If directionX is positive, we exited on the right side
    if (directionX > 0) {
      newWidth = $sourceImage.width - x
    }

    // If directionX is negative, we exited on the left side
    if (directionX < 0) {
      newX = 0
      newWidth = x + width
    }

    // If directionY is positive, we exited on the bottom
    if (directionY > 0) {
      newHeight = $sourceImage.height - y
    }

    // If directionY is negative, we exited on the top
    if (directionY < 0) {
      newY = 0
      newHeight = y + height
    }
    rectState.update(state => ({ ...state, x: newX, y: newY, width: newWidth, height: newHeight, update: true }))
  }

  function toggleActiveClass(active) {
    handles.forEach(handle => {
      if (handle.ref) handle.ref.classList.remove('active')
    })
    if (active) currentHandle.classList.add('active')
  }
  function updatetrimStatsPosition(x, y, width, height) {
    trimStats.style.left = `${x + width / 2}px`
    trimStats.style.top = `${y + height / 2}px`
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
        case 'top-middle':
          r.setAttribute('x', x + width / 2)
          r.setAttribute('y', y)
          break
        case 'bottom-middle':
          r.setAttribute('x', x + width / 2)
          r.setAttribute('y', y + height)
          break
        case 'left-middle':
          r.setAttribute('x', x)
          r.setAttribute('y', y + height / 2)
          break
        case 'right-middle':
          r.setAttribute('x', x + width)
          r.setAttribute('y', y + height / 2)
          break
      }
    })
    focusOverlay.setAttribute('d', `M0,0H${svgRect.width}V${svgRect.height}H0ZM${x},${y}H${x + width}V${y + height}H${x}Z`)
  }

  function resetSVG() {
    isFrameInUse = false
    trimInfo.update(state => ({ ...state, isDefined: false, cancelTrim: true }))
    updateFrameArea(-100, -100, 0, 0)
    handles.forEach(handle => {
      handle.ref.setAttribute('x', -100)
      handle.ref.setAttribute('y', -100)
    })
    focusOverlay.setAttribute('d', 'M-100,-100H0V0H-100ZM-100,-100H0V0H-100Z')
  }
</script>

<div class="trim-stage">
  <div bind:this={trimStats} class="trim-stats-container">
    {#if isFrameInUse || drawing || moving || resizing}
      <div class="trim-stats">
        <p><span>x:</span>{Math.floor($rectState.x * factor)}</p>
        <p><span>y:</span>{Math.floor($rectState.y * factor)}</p>
        <p><span>w:</span>{Math.floor($rectState.width * factor)}</p>
        <p><span>h:</span>{Math.floor($rectState.height * factor)}</p>
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
  svg.inactive {
    background-color: rgba(0, 0, 0, 0.75);
    /* transition: background-color 0.1s; */
  }
  .trim-stage {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .trim-stats-container {
    position: absolute;
    width: 0;
    height: 0;
    overflow: visible;
    /* border: 1px solid blue; */
  }
  .trim-stats {
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
  .trim-stats p {
    white-space: nowrap;
    color: white;
    line-height: 0.75;
    margin: 0;
    text-transform: uppercase;
  }
  .trim-stats span {
    opacity: 0.6;
    display: inline-block;
    width: 2ch;
    text-align: right;
    margin-right: 0.5ch;
  }
  .handle {
    position: relative;
    box-sizing: border-box;
    fill: rgba(255, 255, 255, 0.2);
    stroke: white;
    stroke-weight: 1px;
    opacity: 0.9;
    transform: translate(-7px, -7px);
    transition: filter 0.2s ease-in-out;
  }
  .handle:global(.active) {
    filter: invert(1);
  }
  svg {
    position: relative;
    cursor: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIuMDkxIiB4Mj0iMTIiIHkyPSI3Ljk5MSIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnNxdWFyZTsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7IHN0cm9rZS13aWR0aDozcHg7Ii8+PGxpbmUgeDE9IjEyIiB5MT0iMi4wOTEiIHgyPSIxMiIgeTI9IjcuOTkxIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IzIzMWYyMDsgc3Ryb2tlLWxpbmVjYXA6c3F1YXJlOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsiLz48bGluZSB4MT0iMi4wOTEiIHkxPSIxMiIgeDI9IjcuOTkxIiB5Mj0iMTIiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpzcXVhcmU7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6M3B4OyIvPjxsaW5lIHgxPSIyLjA5MSIgeTE9IjEyIiB4Mj0iNy45OTEiIHkyPSIxMiIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiMyMzFmMjA7IHN0cm9rZS1saW5lY2FwOnNxdWFyZTsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7Ii8+PGxpbmUgeDE9IjEyIiB5MT0iMjEuOTA5IiB4Mj0iMTIiIHkyPSIxNi4wMDkiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojZmZmOyBzdHJva2UtbGluZWNhcDpzcXVhcmU7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyBzdHJva2Utd2lkdGg6M3B4OyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIxLjkwOSIgeDI9IjEyIiB5Mj0iMTYuMDA5IiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IzIzMWYyMDsgc3Ryb2tlLWxpbmVjYXA6c3F1YXJlOyBzdHJva2UtbWl0ZXJsaW1pdDoxMDsiLz48bGluZSB4MT0iMjEuOTA5IiB5MT0iMTIiIHgyPSIxNi4wMDkiIHkyPSIxMiIgc3R5bGU9ImZpbGw6bm9uZTsgc3Ryb2tlOiNmZmY7IHN0cm9rZS1saW5lY2FwOnNxdWFyZTsgc3Ryb2tlLW1pdGVybGltaXQ6MTA7IHN0cm9rZS13aWR0aDozcHg7Ii8+PGxpbmUgeDE9IjIxLjkwOSIgeTE9IjEyIiB4Mj0iMTYuMDA5IiB5Mj0iMTIiIHN0eWxlPSJmaWxsOm5vbmU7IHN0cm9rZTojMjMxZjIwOyBzdHJva2UtbGluZWNhcDpzcXVhcmU7IHN0cm9rZS1taXRlcmxpbWl0OjEwOyIvPjwvc3ZnPg==') 12 11, pointer;
  }
</style>
