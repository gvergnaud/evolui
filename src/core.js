import Observable from './Observable'
import {
  createRaf,
  createOperators,
  isObservable,
  isPromise,
  pipe,
  compose
} from './utils'

const {
  map,
  startWith,
  fromPromise,
  toObservable,
  all,
  switchMap,
  sample
} = createOperators(Observable)

const raf = createRaf(Observable)

// data Variable a
//   = a
//   | Promise (Variable a)
//   | Observable (Variable a)
//   | [Variable a]

// toAStream :: Variable a -> Observable a
const toAStream = variable =>
  Array.isArray(variable)
    ? all(variable.map(toAStream))
    : isObservable(variable)
      ? switchMap(toAStream)(variable)
      : isPromise(variable)
        ? compose(switchMap(toAStream), fromPromise)(variable)
        : toObservable(variable)

// createReactiveTag
//  :: ([String] -> ...[Variable a] -> b)
//  -> [String]
//  -> ...[Variable a]
//  -> Observable b
export const createReactiveTag = tagFunction => (strings, ...variables) =>
  pipe(
    toAStream,
    startWith([]),
    sample(raf),
    map(variables => tagFunction(strings, ...variables))
  )(variables)

export { map }
