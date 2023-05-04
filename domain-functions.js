const defaultLocations = [
  'https://cdn.discordapp.com/attachments/'
  // ... add more default locations here
]

// Retrieve additional locations from localStorage
const getAdditionalLocations = () => {
  const additionalLocations = localStorage.getItem('additionalLocations')
  return additionalLocations ? JSON.parse(additionalLocations) : []
}

// Save additional locations to localStorage
const setAdditionalLocations = locations => {
  localStorage.setItem('additionalLocations', JSON.stringify(locations))
}

// Add a new location to the additional locations list
const addLocation = location => {
  const additionalLocations = getAdditionalLocations()
  if (!additionalLocations.includes(location)) {
    additionalLocations.push(location)
    setAdditionalLocations(additionalLocations)
  }
}

// Check if a location is allowed (either in default locations or additional locations)
const isLocationAllowed = location => {
  const additionalLocations = getAdditionalLocations()
  const isAllowed = defaultLocations.some(defaultLocation => location.startsWith(defaultLocation)) || additionalLocations.some(additionalLocation => location.startsWith(additionalLocation))
  return isAllowed
}

// Helper function to extract the location (origin + pathname) from a URL
const extractLocationFromUrl = url => {
  const urlObj = new URL(url)
  return urlObj.origin + urlObj.pathname
}
