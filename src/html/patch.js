import { createDefaultLifecycle } from '../utils/misc'
import { isEmpty } from '../utils/misc'
import { BehaviorSubject, raf, share, sample, flip } from '../utils/observables'

const sharedRaf = share()(raf)

const toStream = component => flip(component).pipe(sample(sharedRaf))

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
export const render = (
  component,
  element,
  { isSvg = false, morphNode = false } = {}
) => {
  let rootNode = morphNode ? element : element.firstChild
  let previousTree

  return toStream(component).subscribe({
    next: vTree => {
      if (vTree.type === 'VPatch') {
        previousTree = vTree.vTree
      } else {
        if (!rootNode) {
          rootNode = createElement(vTree, isSvg, patch)
          element.appendChild(rootNode)
        } else {
          rootNode = patch(rootNode, previousTree, vTree, isSvg)
        }
        previousTree = vTree
      }
    }
  })
}

export class VText {
  constructor({ text }) {
    this.type = 'VText'
    this.text = text
  }

  createElement() {
    return document.createTextNode(this.text)
  }

  updateElement(node, previousText) {
    if (previousText.text !== this.text) node.textContent = this.text
  }

  removeElement() {}

  mount() {}
}

const updateStyle = (node, previousStyle = {}, nextStyle = {}) => {
  for (const key in { ...previousStyle, ...nextStyle }) {
    const style = !nextStyle || !nextStyle[key] ? '' : nextStyle[key]
    if (nextStyle[key] === previousStyle[key]) {
      // no update needed
    } else if (key[0] === '-') {
      node.style.setProperty(key, style)
    } else {
      node.style[key] = style
    }
  }
}

const updateEvents = (vTree, node, previousEvents) => {
  for (const [eventName, handler] of Object.entries(vTree.events)) {
    if (!previousEvents[eventName]) {
      node.addEventListener(eventName, handler)
    } else if (handler !== previousEvents[eventName]) {
      node.removeEventListener(eventName, previousEvents[eventName])
      node.addEventListener(eventName, handler)
    }
  }

  const removedEventsEntries = Object.entries(previousEvents).filter(
    ([key]) => !vTree.events[key]
  )

  for (const [eventName, handler] of removedEventsEntries) {
    node.removeEventListener(eventName, handler)
  }
}

const updateAttrs = (vTree, node, previousAttrs) => {
  for (const attrName in { ...previousAttrs, ...vTree.attrs }) {
    const attrValue = vTree.attrs[attrName]

    if (attrValue === previousAttrs[attrName]) {
      // no update needed
    } else if (!isEmpty(attrValue)) {
      if (attrName === 'style') {
        updateStyle(node, previousAttrs.style, vTree.attrs.style)
      } else if (attrName === 'value' && node.tagName === 'INPUT') {
        node.value = attrValue
      } else {
        node.setAttribute(attrName, attrValue)
      }
    } else {
      if (attrName === 'value' && node.tagName === 'INPUT') {
        node.value = ''
      } else {
        node.removeAttribute(attrName)
      }
    }
  }
}

const updateChildren = (vTree, node, previousChildren, isSvg, patch) => {
  for (const index in vTree.children) {
    const childTree = vTree.children[index]
    const previousChildTree = previousChildren[index]
    const previousChildNode = node.childNodes[index]

    if (!previousChildNode) {
      const childNode = createElement(childTree, isSvg, patch)
      node.appendChild(childNode)
      mount(childTree, childNode)
    } else {
      patch(previousChildNode, previousChildTree, childTree, isSvg)
    }
  }

  for (const index in [].slice.call(node.childNodes, vTree.children.length)) {
    const realIndex = parseInt(index) + vTree.children.length
    const childTree = previousChildren[realIndex]
    const childNode = node.childNodes[realIndex]
    if (childNode) {
      removeElement(childTree, childNode)
      childNode.remove()
    }
  }
}

export class VNode {
  constructor({
    name,
    attrs = {},
    lifecycle = {},
    events = {},
    children = {},
    key = ''
  }) {
    this.type = 'VNode'
    this.name = name
    this.attrs = attrs
    this.lifecycle = lifecycle
    this.events = events
    this.children = children
    this.key = key
  }

  createElement(isSvg, patch) {
    const node = (isSvg = isSvg || this.name === 'svg')
      ? document.createElementNS('http://www.w3.org/2000/svg', this.name)
      : document.createElement(this.name)

    updateEvents(this, node, {})
    updateAttrs(this, node, {})
    updateChildren(this, node, [], isSvg, patch)

    return node
  }

  updateElement(node, previousTree, isSvg, patch) {
    if (previousTree.name !== this.name) {
      removeElement(previousTree, node)
      return createElement(this, isSvg, patch)
    } else {
      updateEvents(this, node, previousTree.events)
      updateAttrs(this, node, previousTree.attrs)
      updateChildren(this, node, previousTree.children, isSvg, patch)

      this.lifecycle.update(node)
    }
  }

  removeElement(node) {
    this.children.map((child, index) =>
      removeElement(child, node.childNodes[index])
    )

    this.lifecycle.unmount(node)
  }

  mount(node) {
    this.children.map(child => mount(child))

    this.lifecycle.mount(node)
  }
}

export class VPatch {
  constructor({ vTree }) {
    this.type = 'VPatch'
    this.vTree = vTree
  }

  createElement(...args) {
    return createElement(this.vTree, ...args)
  }

  updateElement(...args) {
    return updateElement(this.vTree, ...args)
  }

  removeElement(...args) {
    return removeElement(this.vTree, ...args)
  }

  mount(...args) {
    return mount(this.vTree, ...args)
  }
}

function createPropsStream(props) {
  const sub = new BehaviorSubject(props)
  return {
    next: props => sub.next(props),
    stream: sub
  }
}

export class Component {
  constructor({ name, untouchedAttributes, key = '' }) {
    this.type = 'Component'
    this.name = name
    this.untouchedAttributes = untouchedAttributes
    this.key = key
  }

  createElement(isSvg) {
    let node = isSvg
      ? document.createElementNS('http://www.w3.org/2000/svg', 'g')
      : document.createElement('div')

    this.state = {}
    this.state.props = createPropsStream(this.untouchedAttributes)
    this.state.childTree = undefined

    const vdomStream = this.name(this.state.props.stream)

    if (!vdomStream)
      throw new Error(`Component ${this.name.name} must return a stream!`)

    this.state.subscription = render(vdomStream, node, {
      isSvg,
      morphNode: true
    })

    return node
  }

  updateElement(node, previousComponent, isSvg, patch) {
    this.state = previousComponent.state

    if (previousComponent.name !== this.name) {
      removeElement(previousComponent, node)
      return createElement(this, isSvg, patch)
    } else {
      this.state.props.next(this.untouchedAttributes)
    }
  }

  removeElement(node) {
    this.state.subscription.unsubscribe()
    if (this.state.childTree) removeElement(this.state.childTree, node)
  }

  mount() {}
}

const classes = {
  VNode,
  VText,
  Component
}

export const createElement = (vTree, ...args) =>
  classes[vTree.type].prototype.createElement.apply(vTree, args)

export const mount = (vTree, ...args) =>
  classes[vTree.type].prototype.mount.apply(vTree, args)

export const updateElement = (vTree, ...args) =>
  classes[vTree.type].prototype.updateElement.apply(vTree, args)

export const removeElement = (vTree, ...args) =>
  classes[vTree.type].prototype.removeElement.apply(vTree, args)

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
