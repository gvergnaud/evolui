import { createDefaultLifecycle } from '../utils/misc'

import VNode from './VNode'
import VText from './VText'

function createVTree(node) {
  return new VNode({
    name: node.nodeName.toLowerCase(),
    lifecycle: createDefaultLifecycle(),
    events: {},
    attrs: {},
    untouchedAttributes: {},
    children: Array.prototype.map.call(
      node.childNodes,
      node =>
        node.nodeType === 3 // Node.TEXT_NODE
          ? new VText({ text: node.nodeValue })
          : createVTree(node)
    )
  })
}

export default function patch(
  node,
  previousTree = createVTree(node),
  vTree,
  isSvg
) {
  if (
    vTree.constructor !== previousTree.constructor ||
    vTree.key !== previousTree.key
  ) {
    previousTree.removeElement(node)
    const newNode = vTree.createElement(isSvg, patch)
    node.parentNode.replaceChild(newNode, node)
    vTree.mount(newNode)
    return newNode
  } else {
    const newNode = vTree.updateElement(node, previousTree, isSvg, patch)
    if (newNode) {
      node.parentNode.replaceChild(newNode, node)
      vTree.mount(newNode, isSvg)
      return newNode
    } else {
      return node
    }
  }
}
