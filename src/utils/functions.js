export const compose = (...fns) => x =>
  fns.reduceRight((value, f) => f(value), x)

export const pipe = (...fs) => fs.reduce((acc, f) => x => f(acc(x)), x => x)

export const curry = f => (...args) =>
  args.length >= f.length
    ? f(...args)
    : (...args2) => curry(f)(...args, ...args2)

export const rafThrottle = f => {
  let shouldExecute = true
  let args = []
  return (..._args) => {
    args = _args
    if (!shouldExecute) return
    shouldExecute = false

    window.requestAnimationFrame(() => {
      shouldExecute = true
      f(...args)
    })
  }
}
