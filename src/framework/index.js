import hyperx from 'hyperx'
import vdom, { diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import createStore from './createStore'
import { createOperators } from './utils/observables'

const hx = hyperx(vdom.h)

const createHtml = Observable => {
  const { startWith, toObservable, all, switchMap } = createOperators(
    Observable
  )

  // data Variable a = a | Observable (Variable a) | [Variable a]

  // toAStream :: Variable a -> Observable a
  const toAStream = variable =>
    Array.isArray(variable)
      ? all(variable.map(toAStream))
      : variable instanceof Observable
        ? startWith(switchMap(variable, toAStream), '')
        : startWith(toObservable(variable), '')

  // html :: [String] -> ...[Variable a] -> Observable VirtualDOM
  const html = (strings, ...variables) =>
    toAStream(variables).map(variables => hx(strings, ...variables))

  return html
}

function requestAnimationFrameThrottle(f) {
  let shouldExecute = true
  let args = []

  return (...xs) => {
    args = xs

    if (!shouldExecute) return
    shouldExecute = false

    window.requestAnimationFrame(() => {
      shouldExecute = true
      f.apply(f, args)
    })
  }
}

// render :: Observable VirtualDOM -> DOMElement -> ()
const render = (component, element) => {
  let tree
  let rootNode

  return component.forEach(
    requestAnimationFrameThrottle(newTree => {
      if (!tree) {
        rootNode = createElement(newTree)
        element.appendChild(rootNode)
      } else {
        const patches = diff(tree, newTree)
        rootNode = patch(rootNode, patches)
      }

      tree = newTree
    })
  )
}

export default createHtml

export { html, render, createStore }
