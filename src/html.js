import hyperx from 'hyperx'
import { h, diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import { createReactiveTag, map } from './core'
import { dropRight, last } from './utils'

const hx = hyperx(h)

const addWrappingTag = ([x, ...strings]) => [
  `<div>${x}`,
  ...dropRight(1, strings),
  `${last(strings)}</div>`
]

// const isEmptyVirtualTextNode = c => c.hasOwnProperty('text') && !c.text.trim()

// const removeWrappingTag = ({ children }) => {
//   const childElements = children.filter(c => !isEmptyVirtualTextNode(c))
//   return childElements.length === 1 ? childElements[0] : childElements
// }

// type Tag a b = [String] -> ...[a] -> b

// htmlTag :: Tag a VirtualDOM
const htmlTag = (strings, ...variables) =>
  hx(addWrappingTag(strings), ...variables)

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

class Component {
  constructor(vdom) {
    this.type = 'Widget'
    this.vdom = vdom
  }

  init() {
    return createElement(this.vdom)
  }

  update(previous, domNode) {
    const patches = diff(previous.vdom, this.vdom)
    patch(domNode, patches)
    return null
  }

  destroy(domNode) {
    console.log('destroy', domNode)
  }
}

const create = Class => (...args) => new Class(...args)

// toComponent :: Tag a (Observable VirtalDOM) -> Tag a Component
const toComponent = tag => (strings, ...variables) =>
  map(create(Component), tag(strings, ...variables))

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = toComponent(createReactiveTag(htmlTag))

export { html, render }


// C'est pas ça que je veux faire
// Pour l'instant le render part toujours du top level et descend vers les widget qui se chargent de faire le patch.
// L'objectif est que le subscribe se fasse au niveau du component plutot, et qu'il rerender ses enfants quand il update.
// Le top level ne devrait être utilisé qu'une seule fois, au mount global.

// toComponent devrait utiliser switch map pour renvoyer un observable qui n'emet un update que la première fois.
// ensuite il se charge du diff tout seul et filters tous les next. 
