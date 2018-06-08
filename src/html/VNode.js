import { isEmpty } from '../utils/misc'

function updateStyle(node, previousStyle = {}, nextStyle = {}) {
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

export default class VNode {
  constructor({
    name,
    attrs = {},
    lifecycle = {},
    events = {},
    children = {},
    key = ''
  }) {
    this.name = name
    this.attrs = attrs
    this.lifecycle = lifecycle
    this.events = events
    this.children = children
    this.key = key
  }

  createElement(isSvg, patch, context) {
    const node = (isSvg = isSvg || this.name === 'svg')
      ? document.createElementNS('http://www.w3.org/2000/svg', this.name)
      : document.createElement(this.name)

    this.updateEvents(node, {})
    this.updateAttrs(node, {})
    this.updateChildren(node, [], isSvg, patch, context)

    return node
  }

  updateElement(node, previousTree, isSvg, patch, context) {
    if (previousTree.name !== this.name) {
      previousTree.removeElement(node)
      return this.createElement(isSvg, patch, context)
    } else {
      this.updateEvents(node, previousTree.events)
      this.updateAttrs(node, previousTree.attrs)
      this.updateChildren(node, previousTree.children, isSvg, patch, context)

      this.lifecycle.update(node)
    }
  }

  removeElement(node) {
    this.children.map((child, index) =>
      child.removeElement(node.childNodes[index])
    )

    this.lifecycle.unmount(node)
  }

  mount(node, isSvg, context) {
    this.children.map((child, i) =>
      child.mount(node.childNodes[i], isSvg, context)
    )

    this.lifecycle.mount(node, isSvg, context)
  }

  updateEvents(node, previousEvents) {
    for (const [eventName, handler] of Object.entries(this.events)) {
      if (!previousEvents[eventName]) {
        node.addEventListener(eventName, handler)
      } else if (handler !== previousEvents[eventName]) {
        node.removeEventListener(eventName, previousEvents[eventName])
        node.addEventListener(eventName, handler)
      }
    }

    const removedEventsEntries = Object.entries(previousEvents).filter(
      ([key]) => !this.events[key]
    )

    for (const [eventName, handler] of removedEventsEntries) {
      node.removeEventListener(eventName, handler)
    }
  }

  updateAttrs(node, previousAttrs) {
    for (const attrName in { ...previousAttrs, ...this.attrs }) {
      const attrValue = this.attrs[attrName]

      if (attrValue === previousAttrs[attrName]) {
        // no update needed
      } else if (!isEmpty(attrValue)) {
        if (attrName === 'style') {
          updateStyle(node, previousAttrs.style, this.attrs.style)
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

  updateChildren(node, previousChildren, isSvg, patch, context) {
    for (const index in this.children) {
      const childTree = this.children[index]
      const previousChildTree = previousChildren[index]
      const previousChildNode = node.childNodes[index]

      if (!previousChildNode) {
        const childNode = childTree.createElement(isSvg, patch, context)
        node.appendChild(childNode)
        childTree.mount(childNode, isSvg, context)
      } else {
        patch(previousChildNode, previousChildTree, childTree, isSvg, context)
      }
    }

    for (const index in [].slice.call(node.childNodes, this.children.length)) {
      const realIndex = parseInt(index) + this.children.length
      const childTree = previousChildren[realIndex]
      const childNode = node.childNodes[realIndex]
      if (childNode) {
        childTree.removeElement(childNode)
        childNode.remove()
      }
    }
  }
}
