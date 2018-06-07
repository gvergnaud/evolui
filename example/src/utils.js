import { Subject, fromEvent, merge } from 'rxjs'
import { map, switchMap, startWith, share, takeUntil } from 'rxjs/operators'

export const addPosition = e => {
  e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY }

  return e
}

export const createDragHandler = () => {
  const mouse$ = merge(
    fromEvent(window, 'mousemove').pipe(map(addPosition)),
    fromEvent(window, 'touchmove').pipe(map(addPosition))
  )

  const end$ = merge(
    fromEvent(window, 'mouseup'),
    fromEvent(window, 'touchend')
  )

  const start$ = new Subject()
  const onDragStart = e => start$.next(e)

  const drag$ = start$.pipe(
    map(addPosition),
    switchMap(initialEvent => {
      const { left, top } = initialEvent.target.getBoundingClientRect()
      return mouse$.pipe(
        startWith(addPosition(initialEvent)),
        map(({ position }) => ({
          left: initialEvent.position.x - left,
          top: initialEvent.position.y - top,
          x: position.x - (initialEvent.position.x - left),
          y: position.y - (initialEvent.position.y - top)
        })),
        takeUntil(end$)
      )
    }),
    share()
  )

  const isDragging$ = merge(
    start$.pipe(map(() => true)),
    end$.pipe(map(() => false))
  ).pipe(startWith(false))

  return {
    onDragStart,
    drag$,
    dragStart$: start$,
    dragEnd$: drag$.pipe(switchMap(() => end$)),
    isDragging$
  }
}
