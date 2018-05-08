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
    if (cache[params]) return cache[params]
    cache[params] = getPromise(params)
    return cache[params]
  }
}
