import patch from './patch'
import VPatch from './VPatch'

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element) => {
  let rootNode
  let previousTree

  return component.subscribe({
    next: vTree => {
      if (vTree instanceof VPatch) {
        previousTree = vTree.vTree
      } else {
        if (!rootNode) {
          rootNode = vTree.createElement(false, patch)
          element.appendChild(rootNode)
        } else {
          patch(rootNode, previousTree, vTree)
        }
        previousTree = vTree
      }
    }
  })
}

export default render
