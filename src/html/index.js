import hyperx from 'hyperx'
import h from './h'
import patch, { createElement } from './patch'
import Observable from '../Observable'
import { createReactiveTag } from '../core'

const hx = hyperx(h)

// type Tag a b = [String] -> ...[a] -> b

// htmlTag :: Tag a VirtualDOM
const htmlTag = hx

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

    return vdom$.subscribe({
      complete: () => observer.complete(),
      error: e => observer.error(e),
      next: newTree => {
        const onMount = newTree.lifecycle.mount
        newTree.lifecycle.mount = node => {
          domNode = node
          if (onMount) onMount(node)
        }

        newTree.lifecycle.render = node => {
          domNode = node
          patch(domNode, newTree)
          return domNode
        }

        if (!domNode) observer.next(newTree)
        else patch(domNode, newTree)
      }
    })
  })

// toComponent :: Tag a (Observable VirtalDOM) -> Tag a Component
const toComponent = tag => (strings, ...variables) =>
  createRenderProcess(tag(strings, ...variables))

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = toComponent(createReactiveTag(htmlTag))

export { html, render }
