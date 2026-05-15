import axios from 'axios'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

export async function searchLocation(keyword) {
  const url = 'https://restapi.amap.com/v3/place/text'

  const response = await axios.get(url, {
    params: {
      key: AMAP_KEY,
      keywords: keyword
    }
  })

  return response.data
}

export async function searchDrivingRoute(origin, destination) {
  const url = 'https://restapi.amap.com/v3/direction/driving'

  const response = await axios.get(url, {
    params: {
      key: AMAP_KEY,
      origin,
      destination
    }
  })

  return response.data
}