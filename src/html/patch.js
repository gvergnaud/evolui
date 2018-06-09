import { isEmpty, createDefaultLifecycle } from '../utils/misc'
import { flatten } from '../utils/arrays'
import { pickBy } from '../utils/objects'
import {
  BehaviorSubject,
  raf,
  share,
  sample,
  flip,
  map,
  switchMap,
  shareReplay,
  combineLatestObject
} from '../utils/observables'

const sharedRaf = share()(raf)

const toStream = component => flip(component).pipe(sample(sharedRaf))

// type Style = Map 'style' (Map String (String | Observable String))
//
// type Attr = (Map String (String | Observable String)) | Style
//
// type Props = Map String a
//
// data Tree
//   = VNode {
//     attrs :: Attr,
//     children :: [Tree]
//   }
//   | VText { text :: String | Observable String }
//   | Component { name :: (Observable Props -> Observable Tree) }
//   | [Tree]
//   | Observable Tree

// render :: Tree -> DOMElement -> ()
export const render = (
  initialVTree,
  element,
  context = {},
  { isSvg = false, morphNode = false } = {}
) => {
  let rootNode = morphNode ? element : element.firstChild
  let previousTree

  const component =
    typeof initialVTree === 'function' ? initialVTree(context) : initialVTree

  const sub = toStream(component).subscribe({
    next: vTree => {
      if (vTree.type === 'VPatch') {
        previousTree = vTree.vTree
      } else if (Array.isArray(vTree)) {
        if (!rootNode) {
          rootNode = element
          updateChildren(rootNode, previousTree || [], vTree, isSvg, context)
        } else {
          updateChildren(rootNode, previousTree || [], vTree, isSvg, context)
        }
        previousTree = vTree
      } else {
        if (!rootNode) {
          rootNode = createElement(vTree, isSvg, context)
          element.innerHTML = ''
          element.appendChild(rootNode)
        } else {
          rootNode = patch(rootNode, previousTree, vTree, isSvg, context)
        }
        previousTree = vTree
      }
    }
  })

  return {
    unsubscribe: () => {
      if (previousTree) {
        if (Array.isArray(previousTree)) {
          updateChildren(rootNode, previousTree, [], isSvg, context)
        } else {
          removeElement(previousTree, rootNode)
        }
      }
      sub.unsubscribe()
    }
  }
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

function isShallowEqual(obj1, obj2) {
  for (var k1 in obj1) {
    if (!(k1 in obj2) || obj1[k1] !== obj2[k1]) return false
  }

  for (var k2 in obj2) {
    if (!(k2 in obj1) || obj1[k2] !== obj2[k2]) return false
  }

  return true
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

const updateChildren = (node, previousChildren, children, isSvg, context) => {
  const flatChildren = flatten(children)
  const flatPreviousChildren = flatten(previousChildren)
  for (const index in flatChildren) {
    const childTree = flatChildren[index]
    const previousChildTree = flatPreviousChildren[index]
    const previousChildNode = node.childNodes[index]

    if (!previousChildNode) {
      const childNode = createElement(childTree, isSvg, context)
      node.appendChild(childNode)
      mount(childTree, childNode)
    } else {
      patch(previousChildNode, previousChildTree, childTree, isSvg, context)
    }
  }

  for (const index in [].slice.call(node.childNodes, flatChildren.length)) {
    const realIndex = parseInt(index) + flatChildren.length
    const childTree = flatPreviousChildren[realIndex]
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

  createElement(isSvg, context) {
    const node = (isSvg = isSvg || this.name === 'svg')
      ? document.createElementNS('http://www.w3.org/2000/svg', this.name)
      : document.createElement(this.name)

    updateEvents(this, node, {})
    updateAttrs(this, node, {})
    updateChildren(node, [], this.children, isSvg, context)

    return node
  }

  updateElement(node, previousTree, isSvg, context) {
    if (previousTree.name !== this.name) {
      removeElement(previousTree, node)
      return createElement(this, isSvg, context)
    } else {
      updateEvents(this, node, previousTree.events)
      updateAttrs(this, node, previousTree.attrs)
      updateChildren(node, previousTree.children, this.children, isSvg, context)

      this.lifecycle.update(node)
    }
  }

  removeElement(node) {
    flatten(this.children).map((child, index) =>
      removeElement(child, node.childNodes[index])
    )

    this.lifecycle.unmount(node)
  }

  mount(node) {
    flatten(this.children).map(child => mount(child))

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

const pickNonObservables = props => pickBy((_, key) => !/\$$/.test(key), props)

function createPropsStream(props) {
  const sub = new BehaviorSubject(props)
  return {
    next: props => sub.next(props),
    stream: sub.pipe(
      switchMap(props =>
        combineLatestObject(pickNonObservables(props)).pipe(
          map(values => ({ ...props, ...values }))
        )
      ),
      shareReplay(1)
    )
  }
}

export class Component {
  constructor({ name, untouchedAttributes, key = '' }) {
    this.type = 'Component'
    this.name = name
    this.untouchedAttributes = untouchedAttributes
    this.key = key
  }

  createElement(isSvg, context) {
    let node = isSvg
      ? document.createElementNS('http://www.w3.org/2000/svg', 'g')
      : document.createElement('div')

    this.state = {}
    this.state.props = createPropsStream(this.untouchedAttributes)

    const vTree = this.name(this.state.props.stream)

    if (!vTree)
      throw new Error(`Component ${this.name.name} must return a stream!`)

    this.state.subscription = render(vTree, node, context, {
      isSvg,
      morphNode: true
    })

    return node
  }

  updateElement(node, previousComponent, isSvg, context) {
    this.state = previousComponent.state

    if (previousComponent.name !== this.name) {
      removeElement(previousComponent, node)
      return createElement(this, isSvg, context)
    } else {
      if (
        !isShallowEqual(
          previousComponent.untouchedAttributes,
          this.untouchedAttributes
        )
      ) {
        this.state.props.next(this.untouchedAttributes)
      }
    }
  }

  removeElement() {
    this.state.subscription.unsubscribe()
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
    key: 'INIT',
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
  isSvg,
  context
) {
  if (vTree.type !== previousTree.type || vTree.key !== previousTree.key) {
    removeElement(previousTree, node)
    const newNode = createElement(vTree, isSvg, context)
    node.parentNode.replaceChild(newNode, node)
    mount(vTree, newNode, isSvg)
    return newNode
  } else {
    const newNode = updateElement(vTree, node, previousTree, isSvg, context)
    if (newNode) {
      node.parentNode.replaceChild(newNode, node)
      mount(vTree, newNode, isSvg)
      return newNode
    } else {
      return node
    }
  }
}
