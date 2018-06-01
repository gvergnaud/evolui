import { h } from 'evolui'
import { ease } from 'evolui/extra'
import { Subject, fromEvent, merge, empty, interval } from 'rxjs'
import { map, switchMap, startWith, share, takeUntil } from 'rxjs/operators'
import { addPosition } from '../utils'

const rand = (start, end) => start + Math.random() * (end - start)

const createDragHandler = () => {
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
    switchMap(({ target, position: initPosition }) => {
      const { left, top } = target.getBoundingClientRect()
      return mouse$.pipe(
        map(({ position }) => ({
          left: initPosition.x - left,
          top: initPosition.y - top,
          x: position.x - (initPosition.x - left),
          y: position.y - (initPosition.y - top)
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

const Circle = props$ =>
  props$.pipe(
    map(
      ({
        onDragStart,
        position$,
        isDragging$,
        color = 'purple',
        radius = 25,
        stiffness = 120,
        damping = 20
      }) => (
        <div
          ontouchstart={onDragStart}
          onmousedown={onDragStart}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: radius * 2 + 'px',
            height: radius * 2 + 'px',
            background: color,
            borderRadius: '100%',
            transform: position$.pipe(
              ease({
                x: [stiffness, damping],
                y: [stiffness, damping]
              }),
              map(({ x, y }) => `translate(${x}px, ${y}px)`)
            ),
            cursor: isDragging$.pipe(
              map(
                isDraging => (isDraging ? '-webkit-grabbing' : '-webkit-grab')
              )
            ),
            userSelect: 'none'
          }}
        />
      )
    )
  )

const GrabbableCircle = props$ => {
  const randomPosition = () => ({
    x: rand(0.15, 0.85) * window.innerWidth,
    y: rand(0.1, 0.85) * window.innerHeight
  })

  const center = () => ({
    x: 0.5 * window.innerWidth,
    y: 0.5 * window.innerHeight
  })

  return props$.pipe(
    map(
      ({
        exploadEvery,
        onDragStart,
        drag$,
        isDragging$,
        radius = 25,
        r,
        g,
        b
      }) => {
        const position$ = merge(
          drag$.pipe(
            map(drag => ({
              x: drag.x + drag.left,
              y: drag.y + drag.top
            }))
          ),
          isDragging$.pipe(
            switchMap(
              bool =>
                bool
                  ? empty()
                  : interval(900).pipe(
                      map(x => x),
                      map(
                        x => (x % exploadEvery ? randomPosition() : center())
                      ),
                      startWith(randomPosition())
                    )
            )
          )
        ).pipe(startWith(center()))

        return (
          <div>
            {Array(7)
              .fill(0)
              .map((_, i, xs) => (
                <Circle
                  isDragging$={isDragging$}
                  position$={position$.pipe(
                    map(({ x, y }) => ({
                      x: x - (radius + i),
                      y: y - (radius + i)
                    }))
                  )}
                  onDragStart={onDragStart}
                  stiffness={120 + 15 * i}
                  damping={25 - i * 2}
                  radius={radius + i}
                  color={`rgba(${r}, ${g}, ${b}, ${i / xs.length})`}
                />
              ))}
          </div>
        )
      }
    )
  )
}

const ComplexAnimation = () => {
  const { onDragStart, drag$, isDragging$ } = createDragHandler()

  return (
    <div mount={() => console.log('complex create')}>
      <GrabbableCircle
        radius={50}
        r={255}
        g={255}
        b={255}
        onDragStart={onDragStart}
        drag$={drag$}
        isDragging$={isDragging$}
        exploadEvery={2}
      />
      <GrabbableCircle
        radius={30}
        r={255}
        g={255}
        b={255}
        onDragStart={onDragStart}
        drag$={drag$}
        isDragging$={isDragging$}
        exploadEvery={2}
      />
      <GrabbableCircle
        radius={15}
        r={255}
        g={255}
        b={255}
        onDragStart={onDragStart}
        drag$={drag$}
        isDragging$={isDragging$}
        exploadEvery={4}
      />
      {/*
          <GrabbableCircle
            radius={50}
            r={57}
            g={77}
            b={255}
            onDragStart={onDragStart}
            drag$={drag$}
            isDragging$={isDragging$}
            exploadEvery={2}
          />
          <GrabbableCircle
            radius={30}
            r={249}
            g={0}
            b={114}
            onDragStart={onDragStart}
            drag$={drag$}
            isDragging$={isDragging$}
            exploadEvery={2}
          />
          <GrabbableCircle
            radius={15}
            r={5}
            g={241}
            b={163}
            onDragStart={onDragStart}
            drag$={drag$}
            isDragging$={isDragging$}
            exploadEvery={4}
          />
      */}
    </div>
  )
}

export default () => (
  <div>
    <ComplexAnimation />
  </div>
)
