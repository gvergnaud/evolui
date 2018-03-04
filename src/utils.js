import curry from 'lodash/fp/curry'

const Nothing = 'Nothing'

export const init = xs => xs.slice(0, xs.length - 1)
export const last = xs => xs[xs.length - 1]
export const dropRight = (n, xs) => xs.slice(0, xs.length - n)
export const compose = (...fns) => x => fns.reduceRight((value, f) => f(value), x)
export const pipe = (...fs) => fs.reduce((acc, f) => x => f(acc(x)), x => x)

export const isPromise = p => p && typeof p.then === 'function'
export const isObservable = x => x && typeof x.subscribe === 'function'

export const createOperators = Observable => {
  const fromPromise = p =>
    new Observable(observer => {
      p.then(x => observer.next(x)).catch(e => observer.complete())
    })

  const toObservable = x => (isObservable(x) ? x : Observable.of(x))

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
          error: (e) => {
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
        complete: () => {}
      })
    )
  })

  const sample = curry((sampleStream, stream) => {
    const none = Symbol('None')
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
