import hyperx from 'hyperx'
import h, { VNode } from './h'
import patch, { createElement } from './patch'
import Observable from '../Observable'
import { createReactiveTag } from '../core'
import { dropRight, last } from '../utils'

const hx = hyperx(h, { attrToProp: false })

// type Tag a b = [String] -> ...[a] -> b

const addWrappingTag = ([x, ...strings]) => [
  `<div>${x}`,
  ...dropRight(1, strings),
  `${last(strings)}</div>`
]

const removeWrappingTag = ({ children }) => {
  const childElements = children.filter(c => c instanceof VNode)
  return childElements.length === 1 ? childElements[0] : childElements
}

// htmlTag :: Tag a VirtualDOM
const htmlTag = (strings, ...variables) =>
  removeWrappingTag(hx(addWrappingTag(strings), ...variables))

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element) => {
  let rootNode

  return component.forEach(newTree => {
    if (!rootNode) {
      rootNode = createElement(newTree)
      element.appendChild(rootNode)
    } else {
      patch(rootNode, newTree)
    }
  })
}

const createRenderProcess = vdom$ =>
  new Observable(observer => {
    let domNode
    let tree

    return vdom$.subscribe({
      complete: () => observer.complete(),
      error: e => observer.error(e),
      next: newTree => {
        if (!(newTree instanceof VNode)) return observer.next(newTree)

        tree = newTree

        const onMount = newTree.lifecycle.mount
        tree.lifecycle.mount = node => {
          domNode = node
          if (onMount) onMount(node)
        }

        tree.lifecycle.render = node => {
          domNode = node
          patch(domNode, tree)
        }

        if (!domNode) observer.next(tree)
        else patch(domNode, tree)
      }
    })
  })

// toComponent :: Tag a (Observable VirtalDOM) -> Tag a Component
const toComponent = tag => (strings, ...variables) =>
  createRenderProcess(tag(strings, ...variables))

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = toComponent(createReactiveTag(htmlTag))

export { html, render }
