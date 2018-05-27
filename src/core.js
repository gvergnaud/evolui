import {
  isObservable,
  isPromise,
  raf,
  toObservable,
  all,
  switchMap,
  sample,
  share,
  blockComplete,
  filter,
  startWith,
  map,
  from
} from './utils/observables'
import { compose } from './utils/functions'
import { isEmpty } from './utils/misc'

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
      ? switchMap(flatten, variable)
      : isPromise(variable)
        ? switchMap(flatten, from(variable))
        : toObservable(variable)

export const sharedRaf = share()(raf)

// createReactiveTag
//  :: ([String] -> ...[Variable a] -> b)
//  -> [String]
//  -> ...[Variable a]
//  -> Observable b
export const createReactiveTag = tagFunction => (strings, ...variables) =>
  flatten(variables).pipe(
    blockComplete(),
    startWith([]),
    sample(sharedRaf),
    map(variables => tagFunction(strings, ...variables))
  )
