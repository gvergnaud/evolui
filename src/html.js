import hyperx from 'hyperx'
import { h, diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import { createReactiveTag } from './core'

const hx = hyperx(h)

// type Tag a b = [String] -> ...[a] -> b

// htmlTag :: Tag a VirtualDOM
const htmlTag = hx

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element) => {
  let tree
  let rootNode

  return component.forEach(newTree => {
    if (!tree) {
      rootNode = createElement(newTree)
      element.appendChild(rootNode)
    } else {
      const patches = diff(tree, newTree)
      rootNode = patch(rootNode, patches)
    }

    tree = newTree
  })
}

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = createReactiveTag(htmlTag)

export { html, render }
