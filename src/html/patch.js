import { isEmpty } from '../utils'
import { VNode, VText } from './h'

const vTreeKey = Symbol('vTree')

function updateEvents(node, previousEvents, nextEvents) {
  for (const [eventName, handler] of Object.entries(nextEvents)) {
    if (!previousEvents[eventName]) {
      node.addEventListener(eventName, handler)
    } else if (handler !== previousEvents[eventName]) {
      node.removeEventListener(eventName, previousEvents[eventName])
      node.addEventListener(eventName, handler)
    }
  }

  const removedEventsEntries = Object.entries(previousEvents).filter(
    ([key]) => !nextEvents[key]
  )

  for (const [eventName, handler] of removedEventsEntries) {
    node.removeEventListener(eventName, handler)
  }
}

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

function updateAttrs(node, previousAttrs, nextAttrs) {
  for (const attrName in { ...previousAttrs, ...nextAttrs }) {
    const attrValue = nextAttrs[attrName]

    if (attrValue === previousAttrs[attrName]) {
      // no update needed
    } else if (!isEmpty(attrValue)) {
      if (attrName === 'style') {
        updateStyle(node, previousAttrs.style, nextAttrs.style)
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

function updateChildren(node, nextChildren) {
  for (const index in nextChildren) {
    const childTree = nextChildren[index]

    const previousChildNode = node.childNodes[index]

    if (!previousChildNode) {
      node.appendChild(createElement(childTree))
    } else {
      if (childTree instanceof VNode && childTree.lifecycle.render) {
        childTree.lifecycle.render(previousChildNode, childTree)
      } else {
        updateElement(previousChildNode, childTree)
      }
    }
  }

  for (const childNode of [].slice.call(node.childNodes, nextChildren.length)) {
    removeElement(childNode)
  }
}

export function createElement(vTree) {
  if (vTree instanceof VText) {
    const node = document.createTextNode(vTree.text)
    node[vTreeKey] = vTree
    return node
  } else {
    const node = document.createElement(vTree.name)

    updateEvents(node, {}, vTree.events)
    updateAttrs(node, {}, vTree.attrs)
    updateChildren(node, vTree.children)

    if (vTree.lifecycle.mount) vTree.lifecycle.mount(node)
    node[vTreeKey] = vTree

    return node
  }
}

export function updateElement(node, vTree) {
  const previousTree = node[vTreeKey]

  if (vTree instanceof VText) {
    if (previousTree.text !== vTree.text) node.textContent = vTree.text
    node[vTreeKey] = vTree
  } else {
    if (previousTree.name !== vTree.name) {
      if (previousTree.lifecycle.unmount) previousTree.lifecycle.unmount(node)
      node.parentNode.replaceChild(createElement(vTree), node)
    } else {
      updateEvents(node, previousTree.events, vTree.events)
      updateAttrs(node, previousTree.attrs, vTree.attrs)
      updateChildren(node, vTree.children)

      if (vTree.lifecycle.update) vTree.lifecycle.update(node)
      node[vTreeKey] = vTree
    }
  }

  return node
}

function removeElement(node) {
  if (node[vTreeKey] instanceof VNode && node[vTreeKey].lifecycle.unmount) {
    node[vTreeKey].lifecycle.unmount(node)
  }

  node.remove()
}

export default function patch(node, vTree) {
  if (!node[vTreeKey]) {
    node[vTreeKey] = new VNode({
      name: node.tagName.toLowerCase(),
      lifecycle: {},
      events: {},
      attrs: {},
      children: []
    })
  }
  return updateElement(node, vTree)
}
