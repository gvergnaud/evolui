const init = xs => xs.slice(0, xs.length - 1)
const last = xs => xs[xs.length - 1]
const compose = (...fs) => fs.reduceRight((acc, f) => x => f(acc(x)), x => x)

export class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe
  }

  ['Symbol.observable']() {
    return this
  }

  static get [Symbol.species]() {
    return Observable
  }

  static of(...items) {
    return new Observable(observer => {
      items.forEach((item, i) => {
        observer.next(item)
        if (i === items.length - 1) observer.complete(item)
      })
    })
  }

  static from(x) {
    if (x['Symbol.observable'])
      return new Observable(observer => x['Symbol.observable']().subscribe(observer))
    if (x[Symbol.iterator]) return Observable.of(...x)
  }

  static combineLatest(...xs) {
    const observables = init(xs)
    const combiner = last(xs)
    const UNKNOWN_VALUE = 'UNKNOWN_VALUE'

    const values$ = new Observable(observer => {
      const values = observables.map(() => UNKNOWN_VALUE)

      const subs = observables.map((obs, index) =>
        obs.subscribe({
          error: observer.error,
          complete: observer.complete,
          next: x => {
            values[index] = x
            observer.next(values)
          },
        })
      )

      return { unsubscribe: () => subs.forEach(s => s.unsubscribe()) }
    })

    return values$
      .filter(values => !values.some(v => v === UNKNOWN_VALUE))
      .map(xs => combiner(...xs))
  }

  static all(observables) {
    return Observable.combineLatest(...observables, (...xs) => xs)
  }

  static combineLatestObject(observables) {
    const entriesObservables = Object.entries(observables).map(([key, observable]) =>
      observable.map(value => [key, value])
    )

    return Observable.combineLatest(...entriesObservables, (...entries) =>
      entries.reduce(
        (acc, [key, value]) =>
          Object.assign({}, acc, {
            [key]: value,
          }),
        {}
      )
    )
  }

  combineLatest(...args) {
    return Observable.combineLatest(this, ...args)
  }

  subscribe({ next = x => x, complete = x => x, error = x => x }) {
    let isComplete = false
    let hasError = false

    const gardNext = f => (...args) => {
      if (!isComplete && !hasError) {
        return f(...args)
      }
    }

    const gardComplete = f => (...args) => {
      if (!isComplete && !hasError) {
        isComplete = true
        return f(...args)
      }
    }

    const gardError = f => (...args) => {
      if (!isComplete && !hasError) {
        hasError = true
        return f(...args)
      }
    }

    const subscription = this._subscribe({
      next: gardNext(next),
      complete: gardComplete(complete),
      error: gardError(error),
    })

    return subscription || { unsubscribe: () => {} }
  }

  forEach(f) {
    return new Promise((resolve, reject) =>
      this.subscribe({
        error: reject,
        complete: resolve,
        next: f,
      })
    )
  }

  do(f) {
    return new Observable(observer =>
      this._subscribe({
        error: observer.error,
        next: x => {
          f(x)
          observer.next(x)
        },
        complete: observer.complete,
      })
    )
  }

  filter(predicate) {
    return new Observable(observer =>
      this._subscribe({
        error: observer.error,
        next: x => {
          if (predicate(x)) observer.next(x)
        },
        complete: () => observer.complete,
      })
    )
  }

  map(mapper) {
    return new Observable(observer =>
      this._subscribe({
        error: observer.error,
        next: compose(observer.next, mapper),
        complete: compose(observer.complete, mapper),
      })
    )
  }

  chain(chainer) {
    return new Observable(observer =>
      this._subscribe({
        next: x =>
          chainer(x).subscribe({
            error: observer.error,
            next: observer.next,
            complete: observer.complete,
          }),
        error: observer.error,
        complete: observer.complete,
      })
    )
  }

  switchMap(switchMapper) {
    let subscription

    return new Observable(observer =>
      this._subscribe({
        next: x => {
          if (subscription) subscription.unsubscribe()
          subscription = switchMapper(x).subscribe({
            error: observer.error,
            next: observer.next,
            complete: observer.complete,
          })
        },
        error: observer.error,
        complete: observer.complete,
      })
    )
  }

  startWith(v) {
    return new Observable(observer => {
      observer.next(v)
      return this._subscribe(observer)
    })
  }

  scan(scanner, seed) {
    let acc = seed
    const scanValue = x => {
      acc = scanner(acc, x)
      return acc
    }

    return new Observable(observer =>
      this._subscribe({
        error: observer.error,
        next: compose(observer.next, scanValue),
        complete: observer.complete,
      })
    )
  }

  sample(sampledObservable) {
    return new Observable(observer => {
      let value = 'SAMPLE_INIT'
      let lastValue

      const sampleSubscription = sampledObservable.forEach(_ => {
        if (value !== 'SAMPLE_INIT' && value !== lastValue) {
          observer.next(value)
          lastValue = value
        }
      })

      const subscription = this._subscribe({
        error: observer.error,
        complete: () => {
          sampleSubscription.unsubscribe()
          observer.complete()
        },
        next: v => {
          value = v
        },
      })

      return {
        unsubscribe: () => {
          sampleSubscription.unsubscribe()
          subscription.unsubscribe()
        },
      }
    })
  }

  share() {
    let observers = []
    let subscription = { unsubscribe() {} }

    return new Observable(observer => {
      observers.push(observer)

      if (observers.length === 1) {
        subscription = this._subscribe({
          next: x => observers.forEach(o => o.next(x)),
          complete: () => observers.forEach(o => o.complete()),
          error: x => observers.forEach(o => o.error(x)),
        })
      }

      return {
        unsubscribe: () => {
          observers = observers.filter(o => o !== observer)
          if (observers.length === 0) {
            subscription.unsubscribe()
          }
        },
      }
    })
  }
}

export class Subject extends Observable {
  constructor() {
    super(observer => {
      this.observer = observer
    })
  }

  next(x) {
    this.observer.next(x)
  }

  complete(x) {
    this.observer.complete(x)
  }

  error(x) {
    this.observer.error(x)
  }
}

export class BehaviorSubject extends Subject {
  constructor(value) {
    super()
    this._value = value
  }

  subscribe(observer) {
    const subscription = super.subscribe(observer)
    observer.next(this._value)
    return subscription
  }

  next(x) {
    this._value = x
    return super.next(x)
  }
}
