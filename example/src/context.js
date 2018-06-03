import { merge, fromEvent } from 'rxjs'
import { map, startWith, shareReplay } from 'rxjs/operators'

const toPosition = e =>
  (e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY })

export const mouse$ = merge(
  fromEvent(window, 'mousemove').pipe(map(toPosition)),
  fromEvent(window, 'touchmove').pipe(map(toPosition))
).pipe(
  startWith({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }),
  shareReplay(1)
)
