import { curry } from './functions'

export const init = xs => xs.slice(0, xs.length - 1)

export const last = xs => xs[xs.length - 1]

export const dropRight = (n, xs) => xs.slice(0, xs.length - n)

export const flatMap = curry((f, xs) =>
  xs.reduce((acc, x) => acc.concat(f(x)), [])
)
