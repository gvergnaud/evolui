import hyperx from 'hyperx'
import { h, diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import { createReactiveTag } from './core'
import { dropRight, last } from './utils'

const hx = hyperx(h)

const addWrappingTag = ([x, ...strings]) => [
  `<div>${x}`,
  ...dropRight(1, strings),
  `${last(strings)}</div>`
]

const isVirtualTextNode = c => c.hasOwnProperty('text')

const removeWrappingTag = ({ children }) => {
  const childElements = children.filter(c => !isVirtualTextNode(c))
  return childElements.length === 1 ? childElements[0] : childElements
}

// htmlTag :: [String] -> ...[a] -> VirtualDOM
const htmlTag = (strings, ...variables) =>
  removeWrappingTag(hx(addWrappingTag(strings), ...variables))

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = createReactiveTag(htmlTag)

// render :: Observable VirtualDOM -> DOMElement -> Subscription
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

export { html, render }
