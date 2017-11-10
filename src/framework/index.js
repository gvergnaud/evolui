import hyperx from 'hyperx'
import vdom, { diff, patch } from 'virtual-dom'
import createElement from 'virtual-dom/create-element'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import { toObservable, listen, all, raf } from './utils/observables'
import createStore from './createStore'

const hx = hyperx(vdom.h)

// data Variable a = a | Observable (Variable a) | [Variable a]

// toAStream :: Variable a -> Observable a
const toAStream = variable =>
  Array.isArray(variable)
    ? all(variable.map(toAStream))
    : variable instanceof Observable
      ? variable.switchMap(toAStream).startWith('')
      : toObservable(variable).startWith('')


// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = (strings, ...variables) =>
  toAStream(variables).map(variables => hx(strings, ...variables))


// render :: Observable VirtualDOM -> DOMElement -> ()
const render = (component, element) => {
  let tree
  let rootNode

  return component.sample(raf).forEach(newTree => {
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

export { html, render, listen, createStore, Observable, Subject, BehaviorSubject }
