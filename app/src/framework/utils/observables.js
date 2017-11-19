import { curry } from 'lodash/fp'

const Nothing = 'Nothing'

const init = xs => xs.slice(0, xs.length - 1)
const last = xs => xs[xs.length - 1]
const compose = (...fns) => x => fns.reduceRight((value, f) => f(value), x)
const pipe = (...fs) => fs.reduce((acc, f) => x => f(acc(x)), x => x)

export const createOperators = Observable => {
  const fromPromise = p =>
    new Observable(observer => {
      p.then(x => observer.next(x))
    })

  const toObservable = x =>
    x instanceof Observable
      ? x
      : x instanceof Promise ? fromPromise(x) : Observable.of(x)

  const startWith = curry(
    (initalValue, stream) =>
      new Observable(observer => {
        observer.next(initalValue)
        return stream.subscribe(observer)
      })
  )

  const combineLatest = (...xs) => {
    const observables = init(xs)
    const combiner = last(xs)

    return new Observable(observer => {
      const values = observables.map(() => Nothing)
      const active = observables.map(() => true)

      const subs = observables.map((obs, index) =>
        obs.subscribe({
          error: x => observer.error(x),
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

  const map = curry((mapper, stream) => {
    return new Observable(observer =>
      stream.subscribe({
        error: e => observer.error(e),
        next: x => observer.next(mapper(x)),
        complete: () => observer.complete()
      })
    )
  })

  const switchMap = curry((switchMapper, stream) => {
    let subscription

    return new Observable(observer =>
      stream.subscribe({
        next: x => {
          if (subscription) subscription.unsubscribe()
          subscription = switchMapper(x).subscribe({
            error: e => observer.error(e),
            next: x => observer.next(x),
            complete: () => {}
          })
        },
        error: e => observer.error(e),
        complete: () => observer.complete()
      })
    )
  })

  const sample = curry((sampleStream, stream) => {
    var none = Symbol('None')
    return new Observable(observer => {
      let latestValue = none
      const sub = stream.subscribe({
        next: value => {
          latestValue = value
        },
        complete: () => {},
        error: err => observer.error(err)
      })

      const sampleSub = sampleStream.subscribe({
        next: () => {
          if (latestValue !== none) {
            observer.next(latestValue)
            latestValue = none
          }
        },
        complete: () => observer.complete(),
        error: err => observer.error(err)
      })

      return {
        unsubscribe: () => {
          sub.unsubscribe()
          sampleSub.unsubscribe()
        }
      }
    })
  })

  const all = obs =>
    obs.length ? combineLatest(...obs, (...xs) => xs) : Observable.of([])

  return {
    sample,
    map,
    switchMap,
    all,
    combineLatest,
    startWith,
    toObservable,
    fromPromise,
    compose,
    pipe
  }
}

export const createRaf = Observable =>
  new Observable(observer => {
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
