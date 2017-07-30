import morphdom from 'morphdom'
// import { minifyHTML } from './utils/strings'
import { toObservable, raf, listen, all } from './utils/observables'
import { orderFragments } from './utils/strings'
import { Observable } from 'rxjs'
import defaultEvents from './events'

const toVariablesObservable = variables =>
  variables.length
    ? all(
        variables.map(
          variable =>
            Array.isArray(variable)
              ? all(variable.map(toObservable)).map(htmlStrings => htmlStrings.join(''))
              : toObservable(variable)
        )
      )
    : Observable.of([])

const html = (strings, ...variables) =>
  toVariablesObservable(variables).map(variables => orderFragments(strings, ...variables).join(''))

const render = (component, element) =>
  component.sample(raf).forEach(html => {
    const clone = element.cloneNode()
    clone.innerHTML = html
    morphdom(element, clone, {
      onBeforeElUpdated(sourceEl, targetEl) {
        defaultEvents.forEach(eventName => {
          if (targetEl[eventName]) {
            // if new element has a whitelisted attribute update existing element
            sourceEl[eventName] = targetEl[eventName]
          } else if (sourceEl[eventName]) {
            // if existing element has it and new one doesnt remove it from existing element
            sourceEl[eventName] = undefined
          }
        })
      },
    })
  })

const uniqueId = (() => {
  let i = 0
  return () => ++i
})()

const handler = (() => {
  const listeners = []

  window.trigger = (e, listenerId) => {
    listeners.filter(({ id }) => id === listenerId).forEach(({ f }) => f(e))
  }

  return f => {
    const id = uniqueId()
    listeners.push({ f, id })
    return `trigger(event, ${id})`
  }
})()

export { html, render, listen, handler }
