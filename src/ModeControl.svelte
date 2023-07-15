<script>
  import { trimInfo, params } from './stores.js'

  import Help from './Help.svelte'

  let tucked = false
  let popupOpen = false

  const toggleMode = newMode => {
    if (newMode === 'quadrant') {
      trimInfo.update(state => ({ ...state, index: 1 }))
      params.update(state => ({ ...state, mode: 'quadrant' }))
    }
    if (newMode === 'whole') {
      trimInfo.update(state => ({ ...state, index: 0, expanded: false }))
      params.update(state => ({ ...state, mode: 'whole' }))
    }
  }
  const handleOpen = () => (popupOpen = true)
  const handleOpenKeyEvent = event => {
    if (event.key === '?') popupOpen = true
  }
</script>

<div class:tucked class="mode-control-wrapper" class:triminprogress={$trimInfo.triminprogress}>
  <div class="mode-control-group">
    <div class="mode-control-hide1" aria-hidden="true" on:click={() => (tucked = true)} />
    <div>
      <div class="wordmark" />
      <p class="byline"><a href="https://sidewaysdesign.com" target="blank">by Sideways Design</a></p>
    </div>
    <div class="mode-control-info" on:keydown={handleOpenKeyEvent} on:click={handleOpen} />
    <div class="mode-control-container">
      <div class="mode-control mode-control-whole" on:keydown={event => event.key.toLowerCase() === 'm' && toggleMode('whole')} on:click={() => toggleMode('whole')} aria-label="Whole Image" tabindex="-2" class:active={$params.mode === 'whole'}>
        <span class="tooltip">Whole Image</span>
      </div>
      <div class="mode-control mode-control-quadrant" on:keydown={event => event.key.toLowerCase() === 'm' && toggleMode('quadrant')} on:click={() => toggleMode('quadrant')} aria-label="Quadrant" tabindex="-1" class:active={$params.mode === 'quadrant'}>
        <span class="tooltip">Quadrants</span>
      </div>
    </div>
    <div aria-hidden="true" class="mode-control-hide2" on:click={() => (tucked = false)} />
  </div>
</div>
{#if popupOpen}
  <Help bind:popupOpen />
{/if}

<style>
  .triminprogress {
    opacity: 0;
    transition: 0.2s opacity ease-in-out;
  }
  :root {
    --tuckwidth: 1.5rem;
  }
  .mode-control-hide1,
  .mode-control-hide2 {
    height: 4.75rem;
    opacity: 0.5;
    background-position: center;
    background-repeat: no-repeat;
    background-size: var(--tuckwidth) var(--tuckwidth);
  }
  .mode-control-info {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: -0.125rem;
    margin-left: -0.1875rem;
    background-color: rgba(100, 100, 100, 0);
    background-position: 49% 40%;
    background-repeat: no-repeat;
    background-size: 0.9rem 0.9rem;
    border-radius: 100px;
    border: 1px solid rgba(255, 255, 255, 0.75);
    opacity: 0.7;
    transition: all 0.12s ease-in-out;
  }
  .mode-control-info:hover {
    opacity: 1;
    /* background-color: rgba(100, 100, 100, 0.25); */
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
  }
  .byline a:hover {
    opacity: 1;
  }
  .mode-control:hover .tooltip {
    visibility: visible;
    opacity: 1;
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
    display: flex;
    gap: calc(var(--apppadding) / 4);
  }

  .mode-control-quadrant,
  .mode-control-whole {
    width: var(--buttonsize);
    height: var(--buttonsize);
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
</style>
