<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade, scale } from 'svelte/transition'

  export let popupOpen

  const year = new Date().getFullYear()

  onMount(() => document.addEventListener('keydown', handleKeydown))
  onDestroy(() => document.removeEventListener('keydown', handleKeydown))

  function handleKeydown(event) {
    const keyActions = {
      Escape: () => (popupOpen = false)
    }
    const action = keyActions[event.key]
    if (action) action(event)
  }
  const closePopup = () => (popupOpen = false)
  function handleKeyDown(event) {
    if (event.key === 'Escape') closePopup()
  }
</script>

<div class="help-page-overlay" transition:fade={{ duration: 250 }} on:click={closePopup} on:keydown={handleKeyDown} />
<div class="help-page-wrapper" transition:fade={{ duration: 375 }}>
  <div class="wordmark" />
  <h3>An extension to efficiently trim, save and copy to the clipboard images opened directly in the browser window.</h3>
  <p class="center">Works with PNG, WebP and JPEG formats.</p>
  <div class="help-grid">
    <div class="icon-group">
      <div class="icon-row">
        <div class="icon-unit">
          <div id="icon-mode-whole" class="icon-mode-whole" />
          <label for="icon-mode-whole"><span>Whole</span></label>
        </div>
        <div class="icon-unit">
          <div id="icon-mode-quadrant" class="icon-mode-quadrant" />
          <label for="icon-mode-quadrant"><span>Quadrant</span></label>
        </div>
      </div>
    </div>
    <div class="help-text">
      <h4>Modes</h4>
      <p>Whole mode focuses on the entire image. Quadrant mode splits the image into four equal quadrants, handy for quickly processing 2x2 image grids from sources like Midjourney. Controls appear in each quadrant when the mouse is hovered over them.</p>
    </div>
    <div class="icon-group">
      <div class="icon-group">
        <div class="icon-row">
          <div class="icon-unit">
            <div id="icon-expand" class="icon-expand" />
            <label for="icon-expand"><span>Expand</span></label>
          </div>
          <div class="icon-unit">
            <div id="icon-shrink" class="icon-shrink" />
            <label for="icon-shrink"><span>Shrink</span></label>
          </div>
        </div>
      </div>
    </div>
    <div class="help-text">
      <h4>Expand/Shrink</h4>
      <p>In quadrant mode, Expand the quadrant full screen, or shrink to edit all 4 quadrants. The trim tool is only available when a quadrant is expanded.</p>
    </div>
    <div class="icon-group">
      <div class="icon-unit">
        <div class="icon-triminactive" />
      </div>
    </div>

    <div class="help-text">
      <h4>Trim</h4>
      <p>Draw out a rectangular trim area to save or copy part of the image. Use resize handles to adjust the area, or click and drag within the trim area to move it. Clicking outside the trim area resets and deactivates trimming.</p>
    </div>
    <div class="icon-group">
      <div class="icon-unit">
        <div class="icon-clipboard" />
      </div>
    </div>
    <div class="help-text">
      <h4>Copy</h4>
      <p>Copies the image to the clipboard.</p>
    </div>
    <div class="icon-group">
      <div class="icon-unit">
        <div class="icon-download" />
      </div>
    </div>
    <div class="help-text">
      <h4>Download</h4>
      <p>Saves the image (in the originating file format) to the browser download directory.</p>
    </div>
    <div class="icon-group">
      <div class="icon-unit" />
    </div>
    <div class="help-text">
      <h4>Filename</h4>
      <p>Press enter Click on filename to edit. Note that quadrants are automatically suffixed with "_q1," "_q2," etc.</p>
    </div>
    <div />
    <div class="help-text">
      <h4 class="sm-center gap-top">Keyboard Shortcuts</h4>
      <ul class="nobullets shortcut-list">
        <li><span class="keycap">m</span> Toggle between whole and quadrant modes</li>
        <li><span class="keycap">f</span> Toggle fullscreen mode (in quadrant mode)</li>
        <li><span class="keycap">t</span> Activate trim tool</li>
        <li><span class="keycap">c</span> Copy full image or trim area to clipboard</li>
        <li><span class="keycap">d</span> Download full image or trim area.</li>
        <li><span class="keycap">Shift</span>+ <span class="keycap">D</span> Download all quadrants (in quadrant mode).</li>
        <li><span class="keycap">Esc</span> Deactivate trim tool</li>
        <li><span class="keycap">Enter</span> Edit filename</li>
      </ul>
    </div>
  </div>
  <p class="year">@{year} <a href="https://sidewaysdesign.com/">Sideways Design</a></p>
  <div class="icon-close" on:keydown={handleKeyDown} on:click={closePopup} />
</div>

<style>
  h3,
  h4,
  p {
    margin-top: 0;
    margin-bottom: 0.5em;
    line-height: 1.25;
  }
  p {
    font-size: 0.8rem !important;
  }
  ul {
    padding: 0;
    list-style-type: none;
  }
  h3,
  .center {
    text-align: center;
  }
  p,
  li {
    font-size: 0.82rem;
    line-height: 1.5;
  }
  h3 {
    line-height: 1.4;
    font-size: 1rem;
    font-weight: normal;
    margin-top: -0.5em;
    font-family: var(--fonts);
    max-width: 85%;
    margin-left: auto;
    margin-right: auto;
  }
  h4 {
    font-family: var(--fonts);
    margin-bottom: 0.0625rem;
    font-size: 1.04rem;
  }
  .icon-group {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 0.5rem;
    gap: 0.25rem;
  }
  .icon-row {
    display: grid;
    grid-template-columns: 50px 44px;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    margin-top: -0.375rem;
  }
  .help-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.875rem;
    row-gap: 0.625rem;
  }

  .help-page-wrapper {
    border: 1px solid white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    max-width: calc(100vw - var(--apppadding) * 2);
    max-height: calc(100vh - 100px);
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.88);
    box-shadow: 0.75rem 0.75rem 1.5rem black;
    color: #ddd;
    transition: all 0.5s ease-in-out;
    padding: calc(var(--apppadding) * 2);
    border-radius: var(--apppadding);
    opacity: 1;
    z-index: 1;
  }
  .help-page-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 0;
    opacity: 0.5;
    /* animation: fade-in 0.375s ease-in-out forwards; */
  }

  .icon-close,
  .icon-triminactive,
  .icon-shrink,
  .icon-expand,
  .icon-clipboard,
  .icon-download {
    width: 2rem;
    height: 2rem;
    display: block;
    background-position: center;
  }
  .icon-triminactive {
    background-size: 3.75rem 3.75rem;
  }
  .icon-close,
  .icon-shrink,
  .icon-expand,
  .icon-clipboard,
  .icon-download {
    background-size: 1.875rem 1.875rem;
  }
  .icon-close {
    position: absolute;
    top: var(--apppadding);
    right: var(--apppadding);
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;
  }
  .icon-close:hover {
    opacity: 1;
  }
  .keycap {
    display: inline-block;
    min-width: 1.75rem;
    padding: 0.25rem 0.5rem 0.18755rem 0.5rem;
    text-align: center;
    font-weight: bolder;
    font-size: 0.75rem;
    border: 1px solid #999;
    border-radius: 0.375rem;
    margin-right: 0.25rem;
  }
  .help-page-wrapper > *:last-child {
    margin-bottom: 0;
  }
  .icon-unit {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-basis: 44px;
  }
  .icon-mode-quadrant,
  .icon-mode-whole {
    position: relative;
    width: var(--buttonsize);
    height: var(--buttonsize);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
    margin: 0 0;
    opacity: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  label {
    text-align: center;
    display: block;
    font-size: 0.72rem;
    margin-top: 0.1875rem;
    overflow: visible;
    left: 0;
    width: 0;
    overflow: visible;
    position: relative;
  }
  label span {
    position: absolute;
    left: 50%;
    /* display: block; */
    transform: translateX(-50%);
    /* text-align: center; */
    /* position: relative; */
    /* margin-left: auto; */
    /* margin-right: auto; */
  }
  .icon-group {
    display: flex;
    justify-content: flex-end;
  }
  .icon-mode-whole {
    right: 0;
  }
  .icon-mode-quadrant {
    left: 0;
  }
  .shortcut-list {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 1rem;
    row-gap: 0.625rem;
    margin: 0.875rem 0 0 0;
  }
  @media (max-width: 720px) {
    .help-grid > div:last-child {
      grid-column: 1 / span 2;
    }
    .sm-center {
      text-align: center;
      margin-bottom: 0.75rem;
    }
  }
  @media (max-width: 640px) {
    .shortcut-list {
      grid-template-columns: 1fr;
      justify-content: center;
      margin-top: -0.25rem;
    }
  }
  .wordmark {
    width: 180px;
    height: 40px;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 1.5rem;
  }
  a {
    color: white;
  }
  .year {
    text-align: center;
    margin-top: 1.25rem;
    margin-bottom: -0.25rem;
    font-family: var(--fonts);
  }
  .year a {
    text-decoration: dotted;
  }
  .gap-top {
    margin-top: 0.75rem;
  }
</style>
