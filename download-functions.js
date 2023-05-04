// download-functions.js
function downloadWholeImage(imageUrl) {
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = 'image.png'
  link.click()
}

function initOpenImageViewerBtn() {
  if (locationIsAllowed && window.location.href.match(/\.(png|jpg|jpeg|webp)$/i)) {
    const imageUrl = encodeURIComponent(window.location.href)
    const viewerUrl = chrome.runtime.getURL(`image-viewer.html?image=${imageUrl}`)
    window.location.replace(viewerUrl)
  }
}
const downloadQuadrant = (imageElement, index, filename, extension) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = imageElement.width
  canvas.height = imageElement.height
  ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height)

  const quadrantWidth = imageElement.width / 2
  const quadrantHeight = imageElement.height / 2
  const quadrantCanvas = document.createElement('canvas')
  const quadrantCtx = quadrantCanvas.getContext('2d')
  quadrantCanvas.width = quadrantWidth
  quadrantCanvas.height = quadrantHeight

  let sx, sy
  switch (index) {
    case 0:
      sx = 0
      sy = 0
      break
    case 1:
      sx = quadrantWidth
      sy = 0
      break
    case 2:
      sx = 0
      sy = quadrantHeight
      break
    case 3:
      sx = quadrantWidth
      sy = quadrantHeight
      break
  }

  quadrantCtx.drawImage(canvas, sx, sy, quadrantWidth, quadrantHeight, 0, 0, quadrantWidth, quadrantHeight)

  const dataUrl = quadrantCanvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${filename}.${extension}`
  link.click()
}

function addButtonClickListener(buttonId, action, imageUrl, imageElement) {
  document.getElementById(buttonId).addEventListener('click', () => {
    if (action === 'downloadWholeImage') {
      downloadWholeImage(imageUrl)
    } else {
      downloadQuadrant(imageElement, action)
    }
  })
}

function initializeDownloadButtons(imageUrl, imageElement) {
  addButtonClickListener('downloadWholeImageBtn', 'downloadWholeImage', imageUrl, imageElement)
  addButtonClickListener('downloadTopLeftBtn', 'TopLeftQuadrant', imageUrl, imageElement)
  addButtonClickListener('downloadTopRightBtn', 'TopRightQuadrant', imageUrl, imageElement)
  addButtonClickListener('downloadBottomLeftBtn', 'BottomLeftQuadrant', imageUrl, imageElement)
  addButtonClickListener('downloadBottomRightBtn', 'BottomRightQuadrant', imageUrl, imageElement)
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if the script is running in the context of the image viewer page
  if (window.location.pathname.endsWith('image-viewer.html')) {
    const params = new URLSearchParams(window.location.search)
    const imageUrl = decodeURIComponent(params.get('image'))
    const imageElement = document.getElementById('image')
    imageElement.src = imageUrl
    initializeDownloadButtons(imageUrl, imageElement)
  } else {
    // Check if the script is running in the context of the popup
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentUrl = tabs[0].url
      if (currentUrl.match(/\.(png|jpg|jpeg|webp)$/i)) {
        initializeDownloadButtons(currentUrl, null)
      }
    })
  }
})
