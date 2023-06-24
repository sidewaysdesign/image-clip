<script>
  import { SvelteToast, toast } from '@zerodevx/svelte-toast'
  import { rootnames, trimInfo } from './stores.js'
  import ModeControl from './ModeControl.svelte'
  import ImageBase from './ImageBase.svelte'

  let isFullscreen = false
  // let mode = 'whole'
  let quadsuffix = '_q'
  let imageUrl
  let urlParams

  if (window.location.search) {
    urlParams = new URLSearchParams(window.location.search)
  }
  imageUrl = urlParams?.get('image') || 'https://media.discordapp.net/attachments/1060231236733382769/1105121925421867099/sidewaysdesign_multiple_expressions_of_a_cow_in_the_style_of_sa_62ee6891-cbb7-4f2f-9514-e21833b9fecb.webp'
  // imageUrl = 'https://media.discordapp.net/attachments/1060231236733382769/1105121925421867099/sidewaysdesign_multiple_expressions_of_a_cow_in_the_style_of_sa_62ee6891-cbb7-4f2f-9514-e21833b9fecb.webp'

  const toastOptions = { duration: 1500, intro: { x: 256 } }
  const toastHandler = e => toast.push(e.detail, toastOptions)

  const splitFileNameFromUrl = url => {
    const fileName = url.split('/').pop()
    const [_, nameWithoutExtension, extension] = fileName.match(/(.+)(\.\w+)$/) ?? []
    return { rootname: nameWithoutExtension ?? fileName, imageExtension: extension ?? '' }
  }

  const { rootname, imageExtension } = splitFileNameFromUrl(imageUrl)
  const handleFullscreenChange = event => (isFullscreen = event.detail)
  $: mode = $trimInfo.mode

  let state = {
    currentMode: mode,
    currentName: rootname,
    currentIndex: mode === 'quadrant' ? 1 : 0,
    filenames: [rootname, ...Array.from([1, 2, 3, 4], (_, index) => `${rootname}${quadsuffix}${index + 1}`)]
  }

  $rootnames = state.filenames

  let currentIndex = state.currentIndex
  $: state.currentIndex = currentIndex
</script>

<main>
  <div class="image-wrapper">
    <div class="image-stage" class:fullscreen={isFullscreen}>
      <ImageBase {imageUrl} {currentIndex} on:toastNotice={toastHandler} {mode} {imageExtension} />
    </div>
  </div>
  <ModeControl bind:mode />
  <!-- <div class="close-button" /> -->
</main>
<SvelteToast />

<style>
  .image-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image-stage {
    display: grid;
    align-items: center;
    width: 100%;
    height: 100%;
  }
</style>
