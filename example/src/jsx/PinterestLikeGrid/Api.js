const SKFB_API = 'https://sketchfab.com/i'
const qs = params =>
  `?${Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')}`

export const getLikes = userId =>
  fetch(
    `${SKFB_API}/models${qs({
      count: 12,
      liked_by: userId,
      processing_status: 'succeeded',
      restricted: 1,
      sort_by: '-liked_at'
    })}`
  )
    .then(res => res.json())
    .then(res => res.results)
