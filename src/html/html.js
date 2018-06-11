import createTag from 'vdom-tag'
import h from './h'

// html :: [String] -> ...[Variable a] -> VirtualDOM
const html = createTag(h)

export default html
