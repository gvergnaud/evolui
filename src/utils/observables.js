import { Observable, BehaviorSubject, of, from, combineLatest } from 'rxjs'
import { map, filter, startWith, sample, share } from 'rxjs/operators'
import { curry } from './functions'

export {
  Observable,
  BehaviorSubject,
  of,
  from,
  map,
  filter,
  startWith,
  sample,
  share
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

export const all = obs =>
  obs.length ? combineLatest(...obs, (...xs) => xs) : of([])

export const blockComplete = () => stream =>
  new Observable(observer =>
    stream.subscribe({
      complete: () => {},
      next: x => observer.next(x),
      error: e => observer.error(e)
    })
  )

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
