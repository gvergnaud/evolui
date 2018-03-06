import { createReactiveTag } from './core'

// textTag :: [String] -> ...[a] -> String
const textTag = (strings, ...variables) =>
  strings.reduce(
    (acc, s, i) => acc + s + (variables[i] !== undefined ? variables[i] : ''),
    ''
  )

// text :: [String] -> ...[Variable a] -> Observable String
const text = createReactiveTag(textTag)

export { text }
