export function requestAnimationFrameThrottle(f) {
  let shouldExecute = true
  let args = []

  return (...xs) => {
    args = xs

    if (!shouldExecute) return
    shouldExecute = false

    window.requestAnimationFrame(() => {
      shouldExecute = true
      f.apply(f, args)
    })
  }
}
