import { Observable, BehaviorSubject, of, from, combineLatest } from 'rxjs'
import { map, filter, startWith, share, shareReplay } from 'rxjs/operators'
import { compose, curry } from './functions'
import { isObject, mapValues } from './objects'

export {
  Observable,
  BehaviorSubject,
  of,
  from,
  map,
  filter,
  startWith,
  share,
  shareReplay
}

export const isPromise = p => p && typeof p.then === 'function'

export const isObservable = x => x && typeof x.subscribe === 'function'

export const toObservable = x => (isObservable(x) ? x : of(x))

export const switchMap = curry((switchMapper, stream) => {
  let subscription

  return new Observable(observer => {
    let isOuterStreamComplete = false
    let isInnerStreamComplete = false

    const sub = stream.subscribe({
      next: x => {
        if (subscription) subscription.unsubscribe()
        subscription = switchMapper(x).subscribe({
          error: e => observer.error(e),
          next: x => observer.next(x),
          complete: () => {
            isInnerStreamComplete = true
            if (isOuterStreamComplete) observer.complete()
          }
        })
      },
      error: e => observer.error(e),
      complete: () => {
        isOuterStreamComplete = true
        if (isInnerStreamComplete) observer.complete()
      }
    })

    return {
      unsubscribe: () => {
        if (subscription) subscription.unsubscribe()
        sub.unsubscribe()
      }
    }
  })
})

// all :: [Observable a] -> Observable [a]
export const all = obs =>
  obs.length ? combineLatest(...obs.map(toObservable), (...xs) => xs) : of([])

// combineLatestObject :: Object (Observable a) -> Observable (Object a)
export const combineLatestObject = obj => {
  const keys = Object.keys(obj)
  return keys.length
    ? combineLatest(
        ...keys.map(k => toObservable(obj[k]).pipe(map(v => [k, v]))),
        (...entries) =>
          entries.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
      )
    : of(obj)
}

export const blockComplete = () => stream =>
  new Observable(observer =>
    stream.subscribe({
      complete: () => {},
      next: x => observer.next(x),
      error: e => observer.error(e)
    })
  )

export const sample = curry((sampleStream, stream) => {
  const none = Symbol('None')
  return new Observable(observer => {
    let latestValue = none
    const sub = stream.subscribe({
      next: value => {
        latestValue = value
      },
      complete: () => {},
      error: e => observer.error(e)
    })

    const sampleSub = sampleStream.subscribe({
      next: () => {
        if (latestValue !== none) {
          observer.next(latestValue)
          latestValue = none
        }
      },
      complete: () => observer.complete(),
      error: e => observer.error(e)
    })

    return {
      unsubscribe: () => {
        sub.unsubscribe()
        sampleSub.unsubscribe()
      }
    }
  })
})

export const raf = new Observable(observer => {
  let isSubscribed = true

  const loop = () => {
    if (isSubscribed) {
      observer.next()
      window.requestAnimationFrame(loop)
    }
  }

  window.requestAnimationFrame(loop)

  return {
    unsubscribe: () => {
      isSubscribed = false
    }
  }
})

const applyIf = curry((predicate, f, v) => (predicate(v) ? f(v) : v))

const ifObservable = applyIf(isObservable)

const allIfObservable = applyIf(obs => obs.some(isObservable), all)

const combineLatestObjectIfObservable = applyIf(
  obj => Object.values(obj).some(isObservable),
  combineLatestObject
)

const defaultWith = (value, delayMs = 32) => stream =>
  new Observable(observer => {
    const timeout = setTimeout(() => observer.next(value), delayMs)
    return stream.subscribe({
      next: x => {
        clearTimeout(timeout)
        observer.next(x)
      },
      complete: () => {
        clearTimeout(timeout)
        observer.complete()
      },
      error: e => {
        clearTimeout(timeout)
        observer.error(e)
      }
    })
  })

const _flip = ds =>
  isObservable(ds)
    ? switchMap(compose(toObservable, _flip))(ds)
    : isPromise(ds)
      ? switchMap(compose(toObservable, _flip))(from(ds))
      : Array.isArray(ds)
        ? allIfObservable(
            ds.map(compose(ifObservable(defaultWith(undefined)), _flip))
          )
        : isObject(ds)
          ? ds.type === 'Component'
            ? ds
            : combineLatestObjectIfObservable(
                mapValues(
                  compose(ifObservable(defaultWith(undefined)), _flip),
                  ds
                )
              )
          : ds

export const flip = ds => toObservable(_flip(ds))
