// content.js
const defaultLocations = [
  'https://cdn.discordapp.com/attachments/'
  // ... add more default locations here
]
const getAdditionalLocations = () => {
  const additionalLocations = localStorage.getItem('additionalLocations')
  return additionalLocations ? JSON.parse(additionalLocations) : []
}

const isLocationAllowed = location => {
  const additionalLocations = getAdditionalLocations()
  const isAllowed = defaultLocations.some(defaultLocation => location.startsWith(defaultLocation)) || additionalLocations.some(additionalLocation => location.startsWith(additionalLocation))
  return isAllowed
}

const locationIsAllowed = isLocationAllowed(window.location.href)

if (locationIsAllowed && window.location.href.match(/\.(png|jpg|jpeg|webp)$/i)) {
  const imageUrl = encodeURIComponent(window.location.href)
  const viewerUrl = chrome.runtime.getURL(`image-viewer.html?image=${imageUrl}`)
  window.location.replace(viewerUrl)
}
