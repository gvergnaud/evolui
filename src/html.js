import hyperx from 'hyperx'
import { h, diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import Observable from './Observable'
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

class Component {
  constructor(vdom, newNodeCallback) {
    this.type = 'Widget'
    this.key = vdom.key
    this.vdom = vdom
    this.newNodeCallback = newNodeCallback
  }

  init() {
    const domNode = createElement(this.vdom)
    this.newNodeCallback(domNode)
    if (this.vdom.properties.oncreate) this.vdom.properties.oncreate(domNode)
    return domNode
  }

  update(previous, domNode) {
    if (this.vdom.properties.onupdate) this.vdom.properties.onupdate(domNode)
    const patches = diff(previous.vdom, this.vdom)
    const newNode = patch(domNode, patches)
    this.newNodeCallback(newNode)
    return null
  }

  destroy(domNode) {
    if (this.vdom.properties.onremove) this.vdom.properties.onremove(domNode)
  }
}

const createRenderProcess = vdom$ =>
  new Observable(observer => {
    let domNode
    let tree

    return vdom$.subscribe({
      complete: () => observer.complete(),
      error: e => observer.error(e),
      next: newTree => {
        const comp = new Component(newTree, node => {
          domNode = node
        })

        if (!domNode || !tree) {
          observer.next(comp)
        } else {
          const patches = diff(tree, newTree)
          domNode = patch(domNode, patches)
        }

        tree = newTree
      }
    })
  })

// toComponent :: Tag a (Observable VirtalDOM) -> Tag a Component
const toComponent = tag => (strings, ...variables) =>
  createRenderProcess(tag(strings, ...variables))


// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = toComponent(createReactiveTag(htmlTag))

export { html, render }
