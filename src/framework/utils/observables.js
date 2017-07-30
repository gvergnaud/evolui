import { Observable } from 'rxjs'

export const toObservable = x => (x instanceof Observable ? x : Observable.of(x))

export const joinStringObservables = obs =>
  Observable.combineLatest(...obs, (...values) => values.join(''))

export const listen = (element, event) =>
  new Observable(observer => {
    const handler = e => observer.next(e)
    element.addEventListener(event, handler)
    return { unsubscribe: () => element.removeEventListener(event, handler) }
  })

export const every = miliseconds =>
  new Observable(observer => {
    const interval = setInterval(observer.next, miliseconds)
    return { unsubscribe: () => clearInterval(interval) }
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

export const all = obs => Observable.combineLatest(...obs, (...xs) => xs)
