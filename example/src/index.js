import html, { render, h } from 'evolui'
import { ease } from 'evolui/extra'
import { merge, fromEvent } from 'rxjs'
import { switchMap, map, startWith, shareReplay } from 'rxjs/operators'

const log = (x, label = 'log') => (console.log(label, x), x)

const range = (x, y) =>
  Array(y - x)
    .fill(0)
    .map((_, i) => i + x)

const toPosition = e =>
  (e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY })

const mouse$ = merge(
  fromEvent(window, 'mousemove').pipe(map(toPosition)),
  fromEvent(window, 'touchmove').pipe(map(toPosition))
).pipe(
  startWith({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }),
  shareReplay(1)
)

const Circle = props$ => {
  const style$ = props$.pipe(
    map(
      ({
        key,
        color = 'purple',
        radius = 25,
        stiffness = 120,
        damping = 20
      } = {}) =>
        mouse$.pipe(
          ease(
            {
              x: [stiffness, damping],
              y: [stiffness, damping]
            },
            key
          ),
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
        )
    )
  )
  return <div style={style$} />
}

const Lol = () => (
  <p
    style={{
      fontSize: mouse$.pipe(ease({ x: [120, 18] }), map(m => m.x / 3 + 'px'))
    }}
  >
    LOL
  </p>
)

const sub = render(
  <div>
    <Lol />
    <div>
      {range(0, 10).map(i => (
        <Circle
          key={i}
          stiffness={100 + i * 10}
          damping={16}
          radius={35}
          color={`rgba(5, 241, 163, ${i / 10})`}
        />
      ))}
    </div>
  </div>,
  document.querySelector('#root')
)

// render(
//   <div>
//     {range(0, 10).map(i => (
//       <Circle
//         stiffness={100 + i * 10}
//         damping={16}
//         radius={35}
//         color={`rgba(5, 241, 163, ${(i + 1) / 10})`}
//       />
//     ))}
//   </div>,
//   document.querySelector('#root')
// )

if (module.hot) {
  module.hot.dispose(() => {
    sub.unsubscribe()
  })
}
