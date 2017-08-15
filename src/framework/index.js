import morphdom from 'morphdom'
import { toObservable, raf, listen, all } from './utils/observables'
import { orderFragments } from './utils/strings'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import events from './events'

// data Variable a = a | Observable (Variable a) | Array (Variable a)

// toAStream :: Variable a -> Observable a
const toAStream = variable =>
  Array.isArray(variable)
    ? all(variable.map(toAStream)).map(strings => strings.join(''))
    : variable instanceof Observable ? variable.switchMap(toAStream) : toObservable(variable)

// toVariablesObservable :: [Variable a] -> Observable [a]
const toVariablesObservable = variables => all(variables.map(toAStream))

// html :: [String] -> ...[Variable a] -> Observable String
const html = (strings, ...variables) =>
  toVariablesObservable(variables).map(variables => orderFragments(strings, ...variables).join(''))

const render = (component, element) =>
  component.sample(raf).forEach(html => {
    const clone = element.cloneNode()
    clone.innerHTML = html
    morphdom(element, clone)
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
