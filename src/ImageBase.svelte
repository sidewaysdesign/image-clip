<script>
  export let imageUrl
  export let imageWidth
  export let imageHeight
  export let imageElement
  let isLoading = true // Initialize isLoading to true

  // Define the getImageDimensions function (as provided in previous responses)
  function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = error => {
        reject(error)
      }
      img.src = url
    })
  }

  // Load image dimensions when the component is mounted
  async function loadImageDimensions() {
    try {
      const dimensions = await getImageDimensions(imageUrl)
      imageWidth = dimensions.width
      imageHeight = dimensions.height
    } catch (error) {
      console.error('Error getting image dimensions:', error)
    } finally {
      isLoading = false // Set isLoading to false when the operation is complete
    }
  }

  // Run loadImageDimensions when the component is mounted
  loadImageDimensions()

  const getAspectRatio = (width, height) => {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(width, height)
    const aspectWidth = width / divisor
    const aspectHeight = height / divisor
    return `aspect-ratio: ${aspectWidth} / ${aspectHeight};`
  }
</script>

<!-- Display a spinner while the image is loading -->
{#if isLoading}
  <div class="spinner" />
{:else if imageWidth && imageHeight}
  <!-- Display image dimensions when they are available -->
  <div class="image-base" style={getAspectRatio(imageWidth, imageHeight)}>
    <img crossorigin bind:this={imageElement} id="image" src={imageUrl} alt="Image from image opened directly in browser." />
  </div>
{:else}
  <!-- Display an error message if the image dimensions could not be loaded -->
  <div>
    <p>Error loading image dimensions.</p>
  </div>
{/if}

<!-- Add some basic styles for the spinner -->
<style>
  .spinner {
    border: 4px solid #f3f3f3;
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
