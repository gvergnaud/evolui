import { curry } from './functions'

export const fromEntries = entries =>
  entries.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

export const pickBy = curry((predicate, obj) =>
  fromEntries(
    Object.entries(obj).filter(([key, value]) => predicate(value, key))
  )
)

export const pick = keys => pickBy((_, key) => keys.includes(key))

export const mapValues = curry((f, obj) =>
  Object.keys(obj).reduce((acc, k) => ({ ...acc, [k]: f(obj[k], k) }), {})
)

export const isObject = x => typeof x === 'object' && x !== null
