// content.js

function testOpenQuickTrim() {
  const url = window.location.href
  console.log('Source URL:', url)
  if (url.match(/\.(png|jpg|jpeg|webp)(\?|$)/i) && !url.includes('quicktrim-reset')) {
    const imageUrl = encodeURIComponent(window.location.href)
    const viewerUrl = chrome.runtime.getURL(`index.html?image=${imageUrl}`)
    console.log('QuickTrim redirecting to', viewerUrl)
    window.location.replace(viewerUrl)
  }
}
testOpenQuickTrim()
