import patch from './patch'
import VPatch from './VPatch'

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element, context) => {
  let rootNode = element.firstChild
  let previousTree

  return component.subscribe({
    next: vTree => {
      if (vTree instanceof VPatch) {
        previousTree = vTree.vTree
      } else {
        if (!rootNode) {
          rootNode = vTree.createElement(false, patch, context)
          element.appendChild(rootNode)
        } else {
          patch(rootNode, previousTree, vTree, false, context)
        }
        previousTree = vTree
      }
    }
  })
}

export default render
