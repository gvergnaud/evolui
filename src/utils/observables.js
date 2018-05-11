import { Observable, Subject, of, from, combineLatest } from 'rxjs'
import { map, filter, startWith, scan, sample } from 'rxjs/operators'
import { curry } from './functions'

export { Subject, Observable, of, from, map, filter, startWith, scan, sample }

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

export const shareReplay = curry((count, stream) => {
  let observers = []
  let subscription
  let lastValues = []

  const subscribe = () =>
    stream.subscribe({
      complete: () => observers.forEach(o => o.complete()),
      error: e => observers.forEach(o => o.error(e)),
      next: x => {
        observers.forEach(o => o.next(x))
        lastValues = lastValues
          .concat(x)
          .slice(Math.max(0, lastValues.length - count + 1))
      }
    })

  return new Observable(observer => {
    observers.push(observer)
    if (observers.length === 1) {
      subscription = subscribe()
    }

    lastValues.map(x => observer.next(x))

    return {
      unsubscribe: () => {
        observers = observers.filter(o => o !== observer)
        if (observer.length === 0) {
          subscription.unsubscribe()
          lastValues = []
        }
      }
    }
  })
})

export const share = shareReplay(0)

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
