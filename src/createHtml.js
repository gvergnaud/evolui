import hyperx from 'hyperx'
import { createReactiveTag } from './core'

const createHtml = h => createReactiveTag(hyperx(h))

export { createHtml }
