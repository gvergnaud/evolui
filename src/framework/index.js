import morphdom from 'morphdom'
import copyEvents from 'copy-event-attributes'
import bel from 'bel'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import { toObservable, listen, all } from './utils/observables'
import { zip } from './utils/arrays'
import events from './events'

// data Variable a = a | Observable (Variable a) | [Variable a]

// toAStream :: Variable a -> Observable a
const toAStream = variable =>
  Array.isArray(variable)
    ? all(variable.map(toAStream))
    : variable instanceof Observable ? variable.switchMap(toAStream) : toObservable(variable)

// html :: [String] -> ...[Variable a] -> Observable String
const html = (strings, ...variables) =>
  toAStream(variables).map(variables => {
      console.log(zip(strings, variables))
      return bel(strings, ...variables)
  })


// render :: Observable String -> DOMElement -> ()
const render = (component, element) =>
  component.forEach(dom => {
    if (element.firstChild) {
      morphdom(element.firstChild, dom, { onBeforeMorphEl: copyEvents })
    } else {
      element.appendChild(dom)
    }
  })

export { html, render, listen, Observable, Subject, BehaviorSubject }
