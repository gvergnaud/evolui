import hyperx from 'hyperx'
import { isEqual } from 'lodash'
import { h, diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import createStore from './createStore'
import { createOperators, createRaf } from './utils/observables'

const hx = hyperx(h)

class Widget {
  constructor({ subTree }) {
    this.type = 'Widget'
    this.subTree = subTree
  }

  init() {
    return createElement(this.subTree)
  }

  update(previous, domNode) {
    const patches = diff(previous.subTree, this.subTree)
    patch(domNode, patches)
    return null
  }

  destroy(domNode) {
    console.log('destroy')
  }
}

const createHtml = Observable => {
  const {
    pipe,
    compose,
    map,
    startWith,
    toObservable,
    all,
    switchMap,
    sample
  } = createOperators(Observable)
  const raf = createRaf(Observable)

  // data Variable a = a | Observable (Variable a) | [Variable a]
  // toAStream :: Variable a -> Observable a
  const toAStream = variable =>
    Array.isArray(variable)
      ? all(variable.map(toAStream))
      : variable instanceof Observable
        ? compose(startWith(''), switchMap(toAStream))(variable)
        : compose(startWith(''), toObservable)(variable)

  // html :: [String] -> ...[Variable a] -> Observable VirtualDOM
  const html = (strings, ...variables) =>
    pipe(
      toAStream,
      map(variables => hx(strings, ...variables)),
      sample(raf),
      map(subTree => {
        if (typeof subTree === 'object') return new Widget({ subTree })
        return subTree
      })
    )(variables)

  return html
}

// render :: Observable VirtualDOM -> DOMElement -> Subscription
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

export default createHtml

export { html, render, createStore }
