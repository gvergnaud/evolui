import morphdom from 'morphdom'
import { toObservable, raf, listen, all } from './utils/observables'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import events from './events'
import bel from 'bel'

const log = (x, label = '') => (console.log(label, x), x)
// data Variable a = a | Observable (Variable a) | [Variable a]

// toAStream :: Variable a -> Observable a
const toAStream = variable =>
  Array.isArray(variable)
    ? all(variable.map(toAStream))
    : variable instanceof Observable ? variable.switchMap(toAStream) : toObservable(variable)

// html :: [String] -> ...[Variable a] -> Observable String
const html = (strings, ...variables) =>
  toAStream(variables).map(variables => bel(strings, ...log(variables)))

// render :: Observable String -> DOMElement -> ()
const render = (component, element) =>
  component.sample(raf).forEach(dom => {
    if (element.firstChild) {
      const clone = element.firstChild.cloneNode()
      clone.innerHTML = dom.innerHTML
      morphdom(element.firstChild, clone)
    } else {
      element.appendChild(dom)
    }
  })

const uniqueId = (() => {
  let i = 0
  return () => ++i
})()

const handler = (() => {
  const listeners = []

  events.forEach(name => {
    window.document.body.addEventListener(name, e => {
      const listenerId = e.target.getAttribute(`data-on${name}`)
      if (listenerId) {
        listeners.filter(({ id }) => id === parseInt(listenerId)).forEach(({ f }) => f(e))
      }
    })
  })

  return f => {
    const id = uniqueId()
    listeners.push({ f, id })
    return `${id}`
  }
})()

export { html, render, listen, handler, Observable, Subject, BehaviorSubject }
