<script>
  import { SvelteToast, toast } from '@zerodevx/svelte-toast'
  import { rootnames, trimInfo, isFullScreen, params, quadsuffix, sourceImage } from './stores.js'
  import ModeControl from './ModeControl.svelte'
  import ImageBase from './ImageBase.svelte'

  let imageUrl
  let urlParams

  if (window.location.search) urlParams = new URLSearchParams(window.location.search)

  // imageUrl = urlParams?.get('image') || 'https://media.discordapp.net/attachments/1060231236733382769/1105121925421867099/sidewaysdesign_multiple_expressions_of_a_cow_in_the_style_of_sa_62ee6891-cbb7-4f2f-9514-e21833b9fecb.webp'
  // imageUrl = urlParams?.get('image') || 'https://media.discordapp.net/attachments/1060231236733382769/1126246524905607279/sidewaysdesign_white_palette_on_a_white_background_3c475684-5029-459b-ab37-f5bfac7e9ea4.png'
  imageUrl = urlParams?.get('image') || 'https://media.discordapp.net/attachments/1060231236733382769/1126296883850137600/sidewaysdesign_greyscale_city_skyline_multicolour_equalizer_gra_11365019-942e-4970-9a45-b109a2fe7c08.png'

  const toastOptions = { duration: 1500, intro: { x: 256 } }
  const toastHandler = e => toast.push(e.detail, toastOptions)

  const splitFileNameFromUrl = url => {
    const fileName = url.split('/').pop()
    const [_, nameWithoutExtension, extension] = fileName.match(/(.+)(\.\w+)$/) ?? []
    return { rootname: nameWithoutExtension ?? fileName, imageExtension: extension ?? '' }
  }

  const { rootname, imageExtension } = splitFileNameFromUrl(imageUrl)
  sourceImage.update(state => ({ ...state, url: imageUrl, extension: imageExtension }))
  let { mode } = $params

  let state = {
    currentMode: mode,
    currentName: rootname,
    currentIndex: mode === 'quadrant' ? 1 : 0,
    filenames: [rootname, ...Array.from([1, 2, 3, 4], (_, index) => `${rootname}${$quadsuffix}${index + 1}`)]
  }

  $rootnames = state.filenames

  let currentIndex = state.currentIndex
  $: state.currentIndex = currentIndex
</script>

<main>
  <div class="image-wrapper">
    <div class="image-stage" class:fullscreen={$isFullScreen}>
      <ImageBase {imageUrl} {currentIndex} on:toastNotice={toastHandler} />
    </div>
  </div>
  <ModeControl />
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
