import hyperx from 'hyperx'
import { h, diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/createElement'
import { createOperators, createRaf } from './utils/observables'

const hx = hyperx(h)

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
    pipe(toAStream, map(variables => hx(strings, ...variables)), sample(raf))(
      variables
    )

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
export { render }
