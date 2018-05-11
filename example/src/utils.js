export const addPosition = e => {
  e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY }

  return e
}
