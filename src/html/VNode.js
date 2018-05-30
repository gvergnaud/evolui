import { isEmpty } from '../utils/misc'
import { createElement, mount, removeElement } from './lifecycle'

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

export default class VNode {
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
