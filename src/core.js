import {
  isObservable,
  isPromise,
  raf,
  startWith,
  fromPromise,
  toObservable,
  all,
  map,
  filter,
  switchMap,
  sample,
  share
} from './utils/observables'

import { isEmpty } from './utils/misc'
import { compose } from './utils/functions'

const hasContent = xs => !xs.length || !xs.every(isEmpty)

// data Variable a
//   = a
//   | Promise (Variable a)
//   | Observable (Variable a)
//   | [Variable a]

// flatten :: Variable a -> Observable a
export const flatten = variable =>
  Array.isArray(variable)
    ? all(variable.map(compose(startWith(''), flatten))).pipe(
        filter(hasContent)
      )
    : isObservable(variable)
      ? switchMap(flatten)(variable)
      : isPromise(variable)
        ? switchMap(flatten, fromPromise(variable))
        : toObservable(variable)

export const sharedRaf = share(raf)

// createReactiveTag
//  :: ([String] -> ...[Variable a] -> b)
//  -> [String]
//  -> ...[Variable a]
//  -> Observable b
export const createReactiveTag = tagFunction => (strings, ...variables) =>
  flatten(variables).pipe(
    startWith([]),
    sample(sharedRaf),
    map(variables => tagFunction(strings, ...variables))
  )
