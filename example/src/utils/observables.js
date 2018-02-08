import { Observable } from 'rxjs'

export const listen = (element, event) =>
  new Observable(observer => {
    const handler = e => observer.next(e)
    element.addEventListener(event, handler)
    return { unsubscribe: () => element.removeEventListener(event, handler) }
  })
