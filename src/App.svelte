<script>
  import { SvelteToast, toast } from '@zerodevx/svelte-toast'
  import { rootnames, isFullScreen, params, quadsuffix, sourceImage } from './stores.js'
  import ModeControl from './ModeControl.svelte'
  import ImageBase from './ImageBase.svelte'

  let imageUrl
  let urlParams

  const incomingUrl = window.location.search

  if (incomingUrl) urlParams = new URLSearchParams(incomingUrl)

  imageUrl = urlParams?.get('image') || 'https://picsum.photos/1024/1024'

  const toastOptions = { duration: 1500, intro: { x: 256 } }
  const toastHandler = e => toast.push(e.detail, toastOptions)

  const splitFileNameFromUrl = url => {
    const [baseUrl, parameters] = url.split('?')
    const fileName = baseUrl.split('/').pop()
    const [_, nameWithoutExtension, extension] = fileName.match(/(.+)(\.\w+)$/) ?? []

    return {
      rootname: nameWithoutExtension ?? fileName,
      imageExtension: extension ?? '',
      parameters: parameters ?? ''
    }
  }

  const { rootname, imageExtension, parameters } = splitFileNameFromUrl(imageUrl)
  sourceImage.update(state => ({ ...state, originalUrl: imageUrl, url: `${rootname}.${imageExtension}`, extension: imageExtension }))
  let { mode } = $params

  let state = {
    currentMode: mode,
    currentName: rootname,
    currentIndex: mode === 'quadrant' ? 1 : 0,
    filenames: [rootname, ...Array.from([1, 2, 3, 4], (_, index) => `${rootname}${$quadsuffix}${index + 1}`)]
  }

  $rootnames = state.filenames

  let currentIndex = state.currentIndex
  let popupOpen = false

  $: state.currentIndex = currentIndex
</script>

<main>
  <div class="image-wrapper">
    <div class="image-stage" class:fullscreen={$isFullScreen}>
      <ImageBase {imageUrl} {currentIndex} on:toastNotice={toastHandler} />
    </div>
  </div>
  <ModeControl />
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
