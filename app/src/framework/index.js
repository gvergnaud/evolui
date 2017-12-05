import {
  OpenComponent,
  CloseComponent,
  OpenElement,
  CloseElement,
  SetAttribute,
  RemoveAttribute,
  ToggleClassName,
  CreateTextNode,
  UpdateTextNode,
  ReplaceByTextNode,
  RemoveTextNode,
  Binding
} from './Operation'
import { parser } from './parseFragment'

export class Component {
  constructor(props = {}) {
    this.props = props
  }
  *render() {}
}

class Queue {
  constructor() {
    this.values = []
  }

  get length() {
    return this.values.length
  }

  push(value) {
    this.values.push(value)
  }

  shift() {
    return this.values.shift()
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]()
  }
}

const closestElement = node => {
  return node instanceof HTMLElement || node instanceof DocumentFragment
    ? node
    : closestElement(node.parentNode)
}
const interpret = (op, currentNode) => {
  switch (op && op.constructor) {
    case OpenComponent:
    case CloseComponent:
      return currentNode

    case OpenElement: {
      const element = currentNode.ownerDocument.createElement(op.name)
      return closestElement(currentNode).appendChild(element)
    }
    case CloseElement:
      return currentNode.parentNode

    case SetAttribute: {
      const element = closestElement(currentNode)
      element.setAttribute(op.name, op.value)
      return currentNode
    }
    case RemoveAttribute: {
      const element = closestElement(currentNode)
      element.removeAttribute(op.name)
      return currentNode
    }

    case ToggleClassName: {
      const element = closestElement(currentNode)
      element.classList.toggle(op.className, op.force)
      return currentNode
    }

    case CreateTextNode: {
      const node = currentNode.ownerDocument.createTextNode(op.content)
      return closestElement(currentNode).appendChild(node)
    }
    case UpdateTextNode:
      currentNode.textContent = op.content
      return currentNode
    case ReplaceByTextNode: {
      const node = currentNode.ownerDocument.createTextNode(op.content)
      currentNode.parentNode.replaceChild(node, currentNode)
      return node
    }
    case RemoveTextNode:
      currentNode.parentNode.removeChild(currentNode)
      return currentNode.parentNode

    default:
      throw new TypeError() // TODO
  }
}

export const mount = (generator, root) => {
  const fragment = root.ownerDocument.createDocumentFragment()
  let iteration = generator.next(),
    currentNode = fragment
  while (!iteration.done) {
    if (iteration.value instanceof Binding) {
      const queue = new Queue()
      iteration = generator.next(queue)
      mount(queue[Symbol.iterator](), closestElement(currentNode))
      if (iteration.done) break
    }
    currentNode = interpret(iteration.value, currentNode)
    iteration = generator.next()
  }
  root.appendChild(fragment)
}

const yieldsComponent = function*(component) {
  yield new OpenComponent(component.constructor.name)
  yield* yields(component.render())
  yield new CloseComponent()
}
const yieldsTextNode = function*(content) {
  yield new CreateTextNode(content)
}
const yieldsMany = function*(xs) {
  for (const x of xs) {
    yield* yields(x)
  }
}
const yields = x => {
  if (x instanceof Component) {
    return yieldsComponent(x)
  } else if (typeof x === 'string' || x instanceof String) {
    return yieldsTextNode(x)
  } else if (Array.isArray(x)) {
    return yieldsMany(x)
  } else if (typeof x[Symbol.iterator] === 'function') {
    return x[Symbol.iterator]()
  } else {
    throw new TypeError() // TODO
  }
}

export const render = (component, root) => {
  return mount(yields(component), root)
}

const enqueue = (queue, expr) => {
  if (typeof expr === 'string' || expr instanceof String) {
    queue.push(new CreateTextNode(expr))
  } else if (expr instanceof Component) {
    const generator = yields(expr)
    let iteration = generator.next()
    while (!iteration.done) {
      queue.push(iteration.value)
      iteration = generator.next(queue)
    }
  } else if (Array.isArray(expr)) {
    for (const sub of expr) {
      enqueue(queue, sub)
    }
  } else {
    throw new TypeError() // TODO
  }
}

export const html = function*(fragments, ...exprs) {
  let parserState
  for (const [index, fragment] of fragments.entries()) {
    parserState = yield* parser(fragment, parserState)
    if (index < exprs.length) {
      const queue = yield new Binding()
      enqueue(queue, exprs[index])
    }
  }
}
