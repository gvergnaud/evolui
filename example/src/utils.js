import { Observable, Subject } from 'rxjs'

export const listen = (element, event) =>
  new Observable(observer => {
    const handler = e => observer.next(e)
    element.addEventListener(event, handler)
    return { unsubscribe: () => element.removeEventListener(event, handler) }
  })

export const createFetcher = getPromise => {
  const cache = new Map()
  return params => {
    console.log(cache[params])
    if (cache[params]) return cache[params]
    cache[params] = getPromise(params)
    return cache[params]
  }
}

export const createState = (initialValue) => {
  const stream = new Subject()
  return {
    set: x => stream.next(x),
    stream: stream.startWith(initialValue).shareReplay(1)
  }
}

export const all = obs =>
  obs.length ? Observable.combineLatest(...obs, (...xs) => xs) : Observable.of([])
