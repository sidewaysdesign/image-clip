<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { quadsuffix, popupOpen } from './stores.js'
  import { get_binding_group_value } from 'svelte/internal'
  import HelpArrows from './HelpArrows.svelte'

  const year = new Date().getFullYear()

  onMount(() => document.addEventListener('keydown', handleKeyDown))
  onDestroy(() => document.removeEventListener('keydown', handleKeyDown))

  function handleKeyDown(event) {
    const keyActions = {
      Escape: closePopup()
    }
    const action = keyActions[event.key]
    if (action) action(event)
  }
  const closePopup = () => popupOpen.set(false)

  // function handleKeyDown(event) {
  //   if (event.key === 'Escape') closePopup()
  // }
</script>

<div class="help-page-overlay" transition:fade={{ duration: 250 }} on:click={closePopup} on:keydown={handleKeyDown} />
<div class="help-page-wrapper" transition:fade={{ duration: 375 }}>
  <div class="wordmark" />
  <h3>Quickly trim, save and copy to the clipboard images opened directly in a browser window.</h3>
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
      <p>Whole mode is based on the entire image. Quadrant mode splits the image into four equal quadrants. In quadrant mode, hover over individual quadrant to activate.</p>
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
      <p>Expand quadrant to fill screen/shrink return to 4 quadrants.</p>
    </div>
    <div class="icon-group">
      <div class="icon-unit">
        <div class="icon-triminactive" />
      </div>
    </div>

    <div class="help-text">
      <h4>Trim</h4>
      <p>Draw a rectangular trim area to save or copy part of an image. Click-drag within trim area to move. Drag handles to adjust size. Click outside trim area to reset. Trim tool is only available in a quadrant when expanded.</p>
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
      <p>Saves the image to the browser download directory.</p>
    </div>
    <div class="icon-group">
      <div class="icon-unit" />
    </div>
    <div class="help-text">
      <h4>Filename</h4>
      <p>Click on filename area to edit. Quadrants are suffixed with "{$quadsuffix}1", "{$quadsuffix}2" <em>etc.</em> unless manually edited.</p>
    </div>
    <div />
    <div class="help-text">
      <h4 class="sm-center gap-top">Keyboard Shortcuts</h4>
      <div class="shortcuts-section">
        <ul class="nobullets shortcut-list">
          <li><span class="keycap">M</span> Toggle between whole and quadrant modes</li>
          <li>
            <div class="combo">
              <span class="keycap">1</span>&nbsp;<span class="keycap">2</span>&nbsp;<span class="keycap">3</span>&nbsp;<span class="keycap">4</span>
            </div>
            Switch focus to specific quadrant
          </li>
          <li><span class="keycap">F</span> Toggle fullscreen mode (in quadrant mode)</li>
          <li><span class="keycap">T</span> Activate trim tool</li>
          <li>
            <div class="combo">
              <HelpArrows />
            </div>
            Nudge trim frame
          </li>
          <li>
            <div class="combo">
              <span class="keycap">Shift</span>+ <HelpArrows />
            </div>
            Nudge trim frame by 10
          </li>
          <li>
            <div class="combo">
              <span class="keycap">Ctrl</span>+ <HelpArrows />
            </div>
            Extend trim frame
          </li>
          <li>
            <div class="combo">
              <span class="keycap">Shift</span> + <span class="keycap">Ctrl</span> + <HelpArrows />
            </div>
            Extend trim frame by 10
          </li>
          <li><span class="keycap">D</span> Download full image or trim area.</li>
          <li>
            <div class="combo"><span class="keycap">Shift</span>+ <span class="keycap">D</span></div>
            Download all quadrants at once.
          </li>
          <li><span class="keycap">C</span> Copy full image or trim area to clipboard</li>
          <li><span class="keycap">Esc</span> Exit actions or tools</li>
          <!-- <li><span class="keycap">Enter</span> Edit filename</li> -->
        </ul>
      </div>
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
  .shortcuts-section {
    padding: 0.125rem 0.75rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
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
    transform: translateY(-1px);
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
    transform: translateX(-50%);
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
    display: block;
    grid-template-columns: auto 1fr;
  }
  .shortcut-list li {
    display: grid;
    column-gap: 0.75rem;
    row-gap: 0.875rem;
    grid-template-columns: 10.75rem 1fr;
    margin: 0.875rem 0 0 0;
    align-items: center;
  }
  .shortcut-list li .combo,
  .shortcut-list li span:only-child {
    align-self: start;
    justify-self: end;
    white-space: nowrap;
    display: flex;
    align-items: center;
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
