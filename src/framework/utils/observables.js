const Nothing = 'Nothing'

const init = xs => xs.slice(0, xs.length - 1)
const last = xs => xs[xs.length - 1]

export const createOperators = Observable => {
  const fromPromise = p =>
    new Observable(observer => {
      p.then(x => observer.next(x))
    })

  const toObservable = x =>
    x instanceof Observable
      ? x
      : x instanceof Promise ? fromPromise(x) : Observable.of(x)

  const startWith = (stream, initalValue) =>
    new Observable(observer => {
      observer.next(initalValue)
      return stream.subscribe(observer)
    })

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
                observer.error(err)
                return
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

  const switchMap = (stream, switchMapper) => {
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
  }

  const all = obs =>
    obs.length ? combineLatest(...obs, (...xs) => xs) : Observable.of([])

  return {
    switchMap,
    all,
    combineLatest,
    startWith,
    toObservable,
    fromPromise
  }
}
