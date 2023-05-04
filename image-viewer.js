// image-viewer.js
const params = new URLSearchParams(window.location.search)
const imageUrl = decodeURIComponent(params.get('image'))
const imageElement = document.getElementById('image')
imageElement.src = imageUrl

const addButtonClickListener = (buttonId, action) => {
  document.getElementById(buttonId).addEventListener('click', () => {
    if (action === 'downloadWholeImage') {
      downloadWholeImage()
    } else {
      downloadQuadrant(action)
    }
  })
}

addButtonClickListener('downloadWholeImageBtn', 'downloadWholeImage')
addButtonClickListener('downloadTopLeftBtn', 'TopLeftQuadrant')
addButtonClickListener('downloadTopRightBtn', 'TopRightQuadrant')
addButtonClickListener('downloadBottomLeftBtn', 'BottomLeftQuadrant')
addButtonClickListener('downloadBottomRightBtn', 'BottomRightQuadrant')

function downloadWholeImage() {
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = 'image.png'
  link.click()
}

function downloadQuadrant(quadrant) {
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
  switch (quadrant) {
    case 'TopLeftQuadrant':
      sx = 0
      sy = 0
      break
    case 'TopRightQuadrant':
      sx = quadrantWidth
      sy = 0
      break
    case 'BottomLeftQuadrant':
      sx = 0
      sy = quadrantHeight
      break
    case 'BottomRightQuadrant':
      sx = quadrantWidth
      sy = quadrantHeight
      break
  }

  quadrantCtx.drawImage(canvas, sx, sy, quadrantWidth, quadrantHeight, 0, 0, quadrantWidth, quadrantHeight)

  const dataUrl = quadrantCanvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = 'quadrant.png'
  link.click()
}
