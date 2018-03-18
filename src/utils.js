const Nothing = 'Nothing'

// Functions
export const compose = (...fns) => x =>
  fns.reduceRight((value, f) => f(value), x)
export const pipe = (...fs) => fs.reduce((acc, f) => x => f(acc(x)), x => x)

export const curry = f => (...args) =>
  args.length >= f.length
    ? f(...args)
    : (...args2) => curry(f)(...args, ...args2)

// Array
export const init = xs => xs.slice(0, xs.length - 1)
export const last = xs => xs[xs.length - 1]
export const dropRight = (n, xs) => xs.slice(0, xs.length - n)
export const flatMap = curry((f, xs) =>
  xs.reduce((acc, x) => acc.concat(f(x)), [])
)

// Object
export const fromEntries = entries =>
  entries.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
export const pickBy = curry((predicate, obj) =>
  fromEntries(
    Object.entries(obj).filter(([key, value]) => predicate(value, key))
  )
)
export const pick = keys => pickBy((_, key) => keys.includes(key))

// Misc
export const isEmpty = x =>
  x !== 0 && (!x || (typeof x === 'string' && !x.trim()))

// Promise
export const isPromise = p => p && typeof p.then === 'function'

// Observable
export const isObservable = x => x && typeof x.subscribe === 'function'

export const createOperators = Observable => {
  const point = (...xs) =>
    new Observable(observer => {
      for (const x of xs) observer.next(x)
      observer.complete()
      return { unsubscribe: () => {} }
    })

  const fromPromise = p =>
    new Observable(observer => {
      p.then(x => observer.next(x)).catch(() => observer.complete())
    })

  const toObservable = x => (isObservable(x) ? x : point(x))

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
    obs.length ? combineLatest(...obs, (...xs) => xs) : point([])

  const scan = (scanner, seed, stream) => {
    let acc = seed
    const scanValue = x => {
      acc = scanner(acc, x)
      return acc
    }

    return new Observable(observer =>
      stream.subscribe({
        error: err => observer.error(err),
        next: x => observer.next(scanValue(x)),
        complete: () => observer.complete()
      })
    )
  }

  const throttle = throttler => stream =>
    new Observable(observer => {
      return stream.subscribe({
        complete: throttler(() => observer.complete()),
        error: e => observer.error(e),
        next: throttler(x => observer.next(x))
      })
    })

  const share = stream => {
    let observers = []
    let subscription

    const subscribe = () =>
      stream.subscribe({
        complete: () => observers.forEach(o => o.complete()),
        error: e => observers.forEach(o => o.error(e)),
        next: x => observers.forEach(o => o.next(x))
      })

    return new Observable(observer => {
      observers.push(observer)
      if (observers.length === 1) {
        subscription = subscribe()
      }

      return {
        unsubscribe: () => {
          observers = observers.filter(o => o !== observer)
          if (observer.length === 0) subscription.unsubscribe()
        }
      }
    })
  }

  return {
    point,
    sample,
    map,
    switchMap,
    all,
    combineLatest,
    startWith,
    scan,
    throttle,
    toObservable,
    fromPromise,
    share
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
