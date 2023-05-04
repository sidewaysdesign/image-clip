<script>
  import ImageAction from './ImageAction.svelte'
  import ModeControl from './ModeControl.svelte'
  import ImageBase from './ImageBase.svelte'
  import { SvelteToast, toast } from '@zerodevx/svelte-toast'
  import { rootnames } from './store-rootname.js'

  let isFullscreen = false
  let mode = 'quadrant'
  let imageExtension
  let quadsuffix = '_q'
  let imageElement
  let imageWidth
  let imageHeight

  let imageUrl = 'https://media.discordapp.net/attachments/1060231236733382769/1103726734861410496/sidewaysdesign_closeup_photo_of_a_bird_made_of_canadian_money.__bbddebb9-1fbe-4543-a106-ac19d5d52634.png'

  const getFileExtension = path => {
    const fileName = path.split('/').pop()
    if (!fileName) return ''
    const lastDotIndex = fileName.lastIndexOf('.')
    if (lastDotIndex <= 0) return ''
    const fileExtension = fileName.substring(lastDotIndex + 1)
    return fileExtension
  }

  const extractFilenameFromUrl = urlString => {
    try {
      const url = new URL(urlString)
      const pathname = url.pathname
      const filename = pathname.split('/').pop()
      return filename
    } catch (error) {
      console.error('Invalid URL:', urlString)
      return null
    }
  }

  const handleFullscreenChange = event => (isFullscreen = event.detail)

  imageExtension = getFileExtension(imageUrl)
  let filename = extractFilenameFromUrl(imageUrl)
  let rootname = filename.slice(0, -imageExtension.length)

  let state = {
    currentMode: mode,
    currentName: rootname,
    currentIndex: 0,
    filenames: Array.from([0, 1, 2, 3], (_, index) => `${rootname}${quadsuffix}${index}`)
  }
  rootnames.set(state.filenames)

  const toastOptions = { duration: 1500, intro: { x: 256 } }

  $: currentIndex = state.currentIndex

  function handleRootnameChange(newRootname, index) {
    state.currentName = newRootname
    state.filenames[index] = newRootname
  }
  function toastHandler(value) {
    toast.push(value, toastOptions)
    console.log('toast pushed:', value, toast)
  }
</script>

<main>
  <div class="image-wrapper">
    <div class="image-stage" class:fullscreen={isFullscreen}>
      <ImageBase {imageUrl} bind:imageElement bind:imageWidth bind:imageHeight />
      <div class="image-tracker">
        {#if mode === 'quadrant'}
          {#each [0, 1, 2, 3] as index}
            <div class:active={currentIndex === index} class="quadrant" on:mouseenter={() => (state.currentIndex = index)} style="left:{index === 0 || index === 2 ? '0' : '50%'};  top:{index === 2 || index === 3 ? '50%' : '0'};">
              <ImageAction rootname={state.filenames[index]} {index} {imageElement} {imageExtension} on:downloadaction={e => toastHandler(e.detail)} />
            </div>
          {/each}
        {:else}
          <div class="whole">
            <ImageAction rootname={state.filenames[state.filenames.length](state.filenames.length)} index={state.filenames.length} {imageElement} {imageExtension} />
          </div>
        {/if}
      </div>
    </div>
  </div>

  <button id="openBtn">Mode</button>
  <ModeControl bind:mode />
  <div class="close-button" />
</main>
<SvelteToast />

<style>
  .image-wrapper {
    position: fixed;
    border: 4px solid cyan;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image-stage {
    position: relative;
    display: inline-block;
    width: auto;
    height: auto;
    box-shadow: 0.75rem 0.75rem 1.5rem black;
  }
  .image-base {
    display: block;
    position: relative;
    border: 5px solid yellow;
    /* width: 100%; */
    /* height: 100%; */
  }

  .image-tracker {
    display: block;
    position: absolute;
    border: 2px solid red;
    min-width: 10rem;
    min-height: 10rem;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .quadrant,
  .whole {
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    transition: all 0.12s ease-in-out;
  }
  .quadrant {
    position: absolute;
    border: 2px solid purple;
    width: 50%;
    height: 50%;
  }
  .quadrant.active {
    background: rgba(0, 0, 0, 0);
  }
  .whole {
    width: 100%;
    height: 100%;
  }
</style>
