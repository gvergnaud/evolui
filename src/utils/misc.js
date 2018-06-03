const noOp = () => {}

export const createDefaultLifecycle = () => ({
  mount: noOp,
  update: noOp,
  unmount: noOp
})

export const isEmpty = x =>
  (x !== 0 && (!x || (typeof x === 'string' && !x.trim()))) ||
  (Array.isArray(x) && !x.length)
