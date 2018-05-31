import html, { render, h } from 'evolui'
import { ease } from 'evolui/extra'
import { merge, fromEvent } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

const toPosition = e =>
  (e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY })

const Circle = props$ =>
  props$.pipe(
    map(
      ({
        color = 'purple',
        radius = 25,
        stiffness = 120,
        damping = 20
      } = {}) => {
        const position$ = merge(
          fromEvent(window, 'mousemove').pipe(map(toPosition)),
          fromEvent(window, 'touchmove').pipe(map(toPosition))
        ).pipe(startWith({ x: 0, y: 0 }))

        return (
          <div
            style={position$.pipe(
              ease({
                x: [stiffness, damping],
                y: [stiffness, damping]
              }),
              map(({ x, y }) => ({
                position: 'absolute',
                left: '0',
                top: '0',
                width: radius * 2 + 'px',
                height: radius * 2 + 'px',
                background: color,
                borderRadius: '100%',
                zIndex: -1,
                transform: `translate(${x - radius}px, ${y - radius}px)`
              }))
            )}
          />
        )
      }
    )
  )

render(
  <div>
    {Array(50)
      .fill(0)
      .map((_, i) => (
        <Circle
          stiffness={100 + i * 10}
          damping={16}
          radius={35}
          color={`rgba(5, 241, 163, ${(i + 1) / 10})`}
        />
      ))}
  </div>,
  document.querySelector('#root')
)
