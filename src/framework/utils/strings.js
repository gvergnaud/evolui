import { zip } from './arrays'

export const orderFragments = (literals, ...variables) => zip(literals, variables)

export const minifyHTML = str => str.trim().replace(/(\t|\n|\s)+/g, ' ')
