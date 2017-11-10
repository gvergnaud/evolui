import { Observable } from 'rxjs'


export const fromPromise = p => new Observable(observer => {
  p.then(x => observer.next(x))
})

export const toObservable = x => (
  x instanceof Observable
    ? x
    : x instanceof Promise
      ? fromPromise(x)
      : Observable.of(x)
)

export const listen = (element, event) =>
  new Observable(observer => {
    const handler = e => observer.next(e)
    element.addEventListener(event, handler)
    return { unsubscribe: () => element.removeEventListener(event, handler) }
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
    },
  }
})

export const all = obs =>
  obs.length ? Observable.combineLatest(...obs, (...xs) => xs) : Observable.of([])
