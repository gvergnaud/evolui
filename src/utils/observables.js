import { Observable, Subject } from 'rxjs'
import { curry } from './functions'
import { last, init } from './arrays'

export const isPromise = p => p && typeof p.then === 'function'

export const isObservable = x => x && typeof x.subscribe === 'function'

export const point = (...xs) =>
  new Observable(observer => {
    for (const x of xs) observer.next(x)
    observer.complete()
    return {
      unsubscribe: () => {}
    }
  })

export const fromPromise = p =>
  new Observable(observer => {
    p
      .then(x => observer.next(x))
      .then(() => observer.complete())
      .catch(err => observer.error(err))

    return {
      unsubscribe: () => {}
    }
  })

export const toObservable = x => (isObservable(x) ? x : point(x))

export const startWith = curry(
  (initalValue, stream) =>
    new Observable(observer => {
      observer.next(initalValue)
      return stream.subscribe(observer)
    })
)

const Nothing = 'Nothing'

export const combineLatest = (...xs) => {
  const observables = init(xs)
  const combiner = last(xs)

  return new Observable(observer => {
    const values = observables.map(() => Nothing)
    const active = observables.map(() => true)

    const subs = observables.map((obs, index) =>
      obs.subscribe({
        error: e => {
          console.error(e)
          active[index] = false
          if (active.every(x => x === false)) observer.complete()
        },
        complete: () => {
          active[index] = false
          if (active.every(x => x === false)) observer.complete()
        },
        next: x => {
          values[index] = x

          if (values.every(x => x !== Nothing)) {
            let result
            try {
              result = combiner(...values)
            } catch (err) {
              console.error(err)
            }
            observer.next(result)
          }
        }
      })
    )

    return {
      unsubscribe: () => {
        subs.forEach(s => s.unsubscribe())
      }
    }
  })
}

export const map = curry((mapper, stream) => {
  return new Observable(observer =>
    stream.subscribe({
      error: e => observer.error(e),
      next: x => observer.next(mapper(x)),
      complete: () => observer.complete()
    })
  )
})

export const filter = curry((predicate, stream) => {
  return new Observable(observer =>
    stream.subscribe({
      error: e => observer.error(e),
      next: x => {
        if (predicate(x)) observer.next(x)
      },
      complete: () => observer.complete()
    })
  )
})

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

export const sample = curry((sampleStream, stream) => {
  const none = Symbol('None')
  return new Observable(observer => {
    let latestValue = none
    const sub = stream.subscribe({
      next: value => {
        latestValue = value
      },
      complete: () => observer.complete(),
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

export const all = obs =>
  obs.length ? combineLatest(...obs, (...xs) => xs) : point([])

export const scan = curry((scanner, seed, stream) => {
  let acc = seed
  const scanValue = x => {
    acc = scanner(acc, x)
    return acc
  }

  return new Observable(observer =>
    stream.subscribe({
      error: e => observer.error(e),
      next: x => observer.next(scanValue(x)),
      complete: () => observer.complete()
    })
  )
})

export const throttle = curry(
  (throttler, stream) =>
    new Observable(observer => {
      return stream.subscribe({
        complete: throttler(() => observer.complete()),
        error: e => observer.error(e),
        next: throttler(x => observer.next(x))
      })
    })
)

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

export { Subject, Observable }
