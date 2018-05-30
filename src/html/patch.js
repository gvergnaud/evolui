import { createDefaultLifecycle } from '../utils/misc'
import { mount, createElement, updateElement, removeElement } from './lifecycle'

function createVTree(node) {
  return {
    type: 'VNode',
    name: node.nodeName.toLowerCase(),
    lifecycle: createDefaultLifecycle(),
    events: {},
    attrs: {},
    untouchedAttributes: {},
    children: Array.prototype.map.call(
      node.childNodes,
      node =>
        node.nodeType === 3 // Node.TEXT_NODE
          ? { type: 'VText', text: node.nodeValue }
          : createVTree(node)
    )
  }
}

export default function patch(
  node,
  previousTree = createVTree(node),
  vTree,
  isSvg
) {
  if (vTree.type !== previousTree.type || vTree.key !== previousTree.key) {
    removeElement(previousTree, node)
    const newNode = createElement(vTree, isSvg, patch)
    node.parentNode.replaceChild(newNode, node)
    mount(vTree, newNode, isSvg)
    return newNode
  } else {
    const newNode = updateElement(vTree, node, previousTree, isSvg, patch)
    if (newNode) {
      node.parentNode.replaceChild(newNode, node)
      mount(vTree, newNode, isSvg)
      return newNode
    } else {
      return node
    }
  }
}
