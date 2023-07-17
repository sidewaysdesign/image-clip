// content.js
var imageMaxMb = 16
let bypassQuickTrim = false

function testOpenQuickTrim() {
  if (!bypassQuickTrim && window.location.href.match(/\.(png|jpg|jpeg|webp)$/i)) {
    const imageUrl = encodeURIComponent(window.location.href)
    const viewerUrl = chrome.runtime.getURL(`index.html?image=${imageUrl}`)
    console.log('QuickTrim redirecting to', viewerUrl)
    window.location.replace(viewerUrl)
  }
}

testOpenQuickTrim()
