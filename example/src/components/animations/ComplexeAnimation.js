import { Observable, Subject } from 'rxjs'
import html, { ease } from 'evolui'

const addPosition = e => {
  e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY }

  return e
}

const rand = (start, end) => start + Math.random() * (end - start)

const mouse$ = Observable.merge(
  Observable.fromEvent(window, 'mousemove').map(addPosition),
  Observable.fromEvent(window, 'touchmove').map(addPosition)
)

const end$ = Observable.merge(
  Observable.fromEvent(window, 'mouseup'),
  Observable.fromEvent(window, 'touchend')
)

const createDragHandler = () => {
  const start = new Subject()
  const onDragStart = e => start.next(e)
  const start$ = start.map(addPosition)

  const drag$ = start$
    .switchMap(({ target, position: initPosition }) => {
      const { left, top } = target.getBoundingClientRect()
      return mouse$
        .map(({ position }) => ({
          left: initPosition.x - left,
          top: initPosition.y - top,
          x: position.x - (initPosition.x - left),
          y: position.y - (initPosition.y - top)
        }))
        .takeUntil(end$)
    })
    .share()

  const isDragging$ = start$
    .map(() => true)
    .merge(end$.map(() => false))
    .startWith(false)

  return {
    onDragStart,
    drag$,
    dragStart$: start.$,
    dragEnd$: drag$.switchMap(() => end$),
    isDragging$
  }
}

const Circle = props$ =>
  props$.map(
    ({
      onDragStart,
      position$,
      isDragging$,
      color = 'purple',
      radius = 25,
      stiffness = 120,
      damping = 20
    }) =>
      html`
        <div
          ontouchstart="${onDragStart}"
          onmousedown="${onDragStart}"
          style="
            position: absolute;
            left: 0;
            top: 0;
            width: ${radius * 2}px;
            height: ${radius * 2}px;
            background: ${color};
            border-radius: 100%;
            transform: translate(
              ${position$.map(p => p.x).switchMap(ease(stiffness, damping))}px,
              ${position$.map(p => p.y).switchMap(ease(stiffness, damping))}px
            );
            cursor: ${isDragging$.map(
              isDraging => (isDraging ? '-webkit-grabbing' : '-webkit-grab')
            )};
            user-select: none;
          ">
        </div>
      `
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

  return props$.switchMap(
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
      const position$ = drag$
        .map(drag => ({
          x: drag.x + drag.left,
          y: drag.y + drag.top
        }))
        .merge(
          isDragging$.switchMap(
            bool =>
              bool
                ? Observable.empty()
                : Observable.interval(900)
                    .map(x => x)
                    .map(x => (x % exploadEvery ? randomPosition() : center()))
                    .startWith(randomPosition())
          )
        )
        .startWith(center())

      return html`
        <div>
          ${Array(7)
            .fill(0)
            .map(
              (_, i, xs) =>
                html`
                  <${Circle}
                    ${{
                      isDragging$,
                      position$: position$.map(({ x, y }) => ({
                        x: x - (radius + i),
                        y: y - (radius + i)
                      })),
                      onDragStart: onDragStart,
                      stiffness: 120 + 15 * i,
                      damping: 25 - i * 2,
                      radius: radius + i,
                      color: `rgba(${r}, ${g}, ${b}, ${i / xs.length})`
                    }}
                  />
                `
            )}
        </div>
      `
    }
  )
}

const ComplexAnimation = () => {
  const { onDragStart, drag$, isDragging$ } = createDragHandler()
  return html`
    <div mount="${() => console.log('complex create')}">
      <${GrabbableCircle}
        ${{
          radius: 50,
          r: 57,
          g: 77,
          b: 255,
          onDragStart,
          drag$,
          isDragging$,
          exploadEvery: 2
        }}
      />
      <${GrabbableCircle}
        ${{
          radius: 30,
          r: 249,
          g: 0,
          b: 114,
          onDragStart,
          drag$,
          isDragging$,
          exploadEvery: 2
        }}
      />
      <${GrabbableCircle}
        ${{
          radius: 15,
          r: 5,
          g: 241,
          b: 163,
          onDragStart,
          drag$,
          isDragging$,
          exploadEvery: 4
        }}
      />
    </div>
  `
}

export default ComplexAnimation
