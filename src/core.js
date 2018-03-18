import Observable from './Observable'
import {
  createOperators,
  isObservable,
  isPromise,
  pipe,
  compose,
  createRaf
} from './utils'
const {
  map,
  startWith,
  fromPromise,
  toObservable,
  all,
  switchMap,
  sample,
  share
} = createOperators(Observable)

const raf = share(createRaf(Observable))

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
