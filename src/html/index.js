import createTag from 'vdom-tag'
import { createReactiveTag } from '../core'
import patch from './patch'
import h from './h'

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element) => {
  let rootNode
  let previousTree

  return component.subscribe({
    next: vTree => {
      if (!rootNode) {
        rootNode = vTree.createElement(false, patch)
        element.appendChild(rootNode)
      } else {
        patch(rootNode, previousTree, vTree)
        previousTree = vTree
      }
    }
  })
}

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = createReactiveTag(createTag(h))

export { html, render }
