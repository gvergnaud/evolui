import { raf, share, sample, flip } from '../utils/observables'
import patch from './patch'
import { createElement } from './lifecycle'

const sharedRaf = share()(raf)

const toStream = component => flip(component).pipe(sample(sharedRaf))

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element) => {
  let rootNode = element.firstChild
  let previousTree

  return toStream(component).subscribe({
    next: vTree => {
      if (vTree.type === 'VPatch') {
        previousTree = vTree.vTree
      } else {
        if (!rootNode) {
          rootNode = createElement(vTree, false, patch)
          element.appendChild(rootNode)
        } else {
          rootNode = patch(rootNode, previousTree, vTree)
        }
        previousTree = vTree
      }
    }
  })
}

export default render
