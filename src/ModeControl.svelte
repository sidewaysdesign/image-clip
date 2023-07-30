<script>
  import { trimInfo, params, isFullScreen, popupOpen, sourceImage } from './stores.js'

  import Help from './Help.svelte'

  let tucked = false

  const toggleMode = newMode => {
    trimInfo.update(state => ({ ...state, cancelTrim: true }))
    if (newMode === 'quadrant') {
      trimInfo.update(state => ({ ...state, index: 1 }))
      params.update(state => ({ ...state, mode: 'quadrant' }))
    }
    if (newMode === 'whole') {
      isFullScreen.set(false)
      trimInfo.update(state => ({ ...state, index: 0, expanded: false }))
      params.update(state => ({ ...state, mode: 'whole' }))
    }
  }
  const handleOpen = () => popupOpen.set(true)
  const handleOpenKeyEvent = event => {
    if (event.key === '?') popupOpen.set(true)
  }
  const tuckIt = () => {
    tucked = true
  }
  const untuckIt = () => {
    tucked = false
  }
  const resetHandler = () => {
    // const paramDelimiter = $sourceImage.originalUrl.includes('?') ? '&' : '?'
    replaceDOMWithImage($sourceImage.originalUrl, $sourceImage.width, $sourceImage.height)
    // window.location.href = `${$sourceImage.originalUrl}${paramDelimiter}quicktrim-reset=true`

    // $trimInfo.width
  }
  function handleExitEvent(event) {
    if (event.key === 'Escape' && event.shiftKey) resetHandler()
  }
  const replaceDOMWithImage = (url, width, height) => {
    document.body.innerHTML = `
    <img style="display: block;-webkit-user-select: none;margin: auto;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;" src="${url}" width="${width}" height="${height}" style="object-fit: contain;">
    `
    document.head.innerHTML = `
    <meta name="viewport" content="width=device-width, minimum-scale=0.1">
    <title>${url}</title>
    `
    document.body.style.cssText = 'display:flex; margin: auto 0; background: #0e0e0e; height: 100%;'
    document.documentElement.style.cssText = 'height: 100%;'
  }
</script>

<div class:tucked class="mode-control-wrapper" class:triminprogress={$trimInfo.triminprogress}>
  <div class="mode-control-group">
    <div class="mode-control-hide1" aria-hidden="true" on:click={tuckIt} />
    <div>
      <div class="wordmark" />
      <p class="byline"><a href="https://sidewaysdesign.com" target="blank">by Sideways Design</a></p>
    </div>
    <div class="mode-control-container">
      <div class="mode-control mode-control-whole" on:keydown={event => event.key.toLowerCase() === 'm' && toggleMode('whole')} on:click={() => toggleMode('whole')} aria-label="Whole Image" tabindex="-2" class:active={$params.mode === 'whole'}>
        <span class="tooltip">Whole</span>
      </div>
      <div class="mode-control mode-control-quadrant" on:keydown={event => event.key.toLowerCase() === 'm' && toggleMode('quadrant')} on:click={() => toggleMode('quadrant')} aria-label="Quadrant" tabindex="-1" class:active={$params.mode === 'quadrant'}>
        <span class="tooltip">Quadrants</span>
      </div>
    </div>
    <div class="mode-control-container">
      <div class="mode-control mode-control-exit" on:keydown={handleExitEvent} on:click={resetHandler}><span class="tooltip">Exit</span></div>
      <div class="mode-control mode-control-info" on:keydown={handleOpenKeyEvent} on:click={handleOpen}><span class="tooltip">Help</span></div>
    </div>
    <div aria-hidden="true" class="mode-control-hide2" on:click={untuckIt} />
  </div>
</div>
{#if $popupOpen}
  <Help />
{/if}

<style>
  .triminprogress {
    opacity: 0;
    transition: 0.2s opacity ease-in-out;
  }
  :root {
    --tuckwidth: 1.375rem;
  }
  .mode-control-hide1,
  .mode-control-hide2 {
    height: 4.75rem;
    opacity: 0.5;
    background-position: center;
    background-repeat: no-repeat;
    background-size: var(--tuckwidth) var(--tuckwidth);
  }
  .mode-control-exit,
  .mode-control-info {
    width: calc(var(--buttonsize) * 0.65625);
    height: calc(var(--buttonsize) * 0.65625);
    /* margin-right: -0.125rem; */
    /* margin-left: -0.1875rem; */
    background-color: rgba(100, 100, 100, 0);
    background-position: 45% 45%;
    background-repeat: no-repeat;
    opacity: 0.7;
    transition: all 0.12s ease-in-out;
  }
  .mode-control-exit {
    width: calc(var(--buttonsize) * 0.8125);
    height: calc(var(--buttonsize) * 0.8125);
    background-size: calc(var(--buttonsize) * 0.75);
  }
  .mode-control-info {
    border-radius: 100px;
    border: 2px solid rgba(255, 255, 255, 0.75);
    background-size: 1rem;
    transform: translateY(0.1875rem);
  }
  .mode-control-info:hover {
    opacity: 1;
  }
  .mode-control-info:active {
    opacity: 1;
    background-color: rgba(100, 100, 100, 0.5);
  }
  .mode-control-hide1:hover,
  .mode-control-hide2:hover {
    opacity: 0.75;
  }
  .mode-control-hide1 {
    width: var(--tuckwidth);
  }
  .mode-control-hide2 {
    width: 0;
    transition: opacity 0.25s ease-in-out;
    transition-delay: 0.5s;
    margin-right: -1rem;
  }
  .tucked {
    transform: translateX(calc(-100% + var(--tuckwidth)));
  }
  .tucked .mode-control-hide2 {
    width: var(--tuckwidth);
    transition: width 0.25s ease-in-out, opacity 0.25s ease-in-out;
    transition-delay: 0.25s;
  }
  .byline,
  .byline a {
    color: white;
    text-decoration: none;
    font-size: 0.82rem;
    line-height: 0.9;
    margin: 0;
    transition: opacity 0.2s ease-in-out;
    font-family: var(--fonts);
    opacity: 0.8;
    font-weight: lighter;
  }
  .byline a:hover {
    opacity: 1;
  }
  .mode-control {
    position: relative;
  }
  .mode-control:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  .mode-control-info:hover .tooltip {
    top: 1.5625rem;
    display: block;
    height: 1.25rem;
  }

  .mode-control-wrapper {
    display: inline-block;
    transition: transform 0.5s ease-in-out, opacity 0.2s ease-in-out;
  }
  .mode-control-group {
    display: flex;
    position: relative;
    min-width: calc(var(--buttonsize) * 2);
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0 var(--apppadding) 0 0;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.75);
    gap: calc(var(--apppadding) * 0.75);
    border-bottom-right-radius: calc(var(--buttonsize) * 0.7);
    border: 1px solid white;
    border-top-width: 0;
    border-left-width: 0;
  }
  .mode-control-container {
    position: relative;
    display: flex;
    gap: calc(var(--apppadding) / 3);
  }
  .mode-control-container {
    margin-left: 0;
  }
  .mode-control-container + .mode-control-container {
    margin-left: 0.375rem;
    column-gap: 0.4375rem;
  }
  .mode-control-container + .mode-control-container::before {
    position: absolute;
    content: '';
    width: 1px;
    height: 130%;
    left: -0.5625rem;
    background-color: white;
    top: -15%;
  }
  .mode-control-quadrant,
  .mode-control-whole {
    width: calc(var(--buttonsize) * 0.8125);
    height: calc(var(--buttonsize) * 0.8125);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    position: relative;
    margin: 0 0;
    transition: all 0.3s;
    opacity: 0.4;
    display: block;
  }
  [class*='mode-control-']:hover {
    opacity: 1;
  }
  .active {
    opacity: 1;
    border: 1px;
    background-color: (255, 255, 255, 0.75);
  }
  .wordmark {
    width: 122px;
    height: 30px;
    background-position: left center;
    background-size: contain;
    background-repeat: no-repeat;
    margin: 0 auto 0.375rem 0;
  }
  .wordmark,
  .byline {
    margin-left: -0.375rem;
  }
</style>
