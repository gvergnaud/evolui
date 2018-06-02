import { h } from 'evolui'
import { ease } from 'evolui/extra'
import { map } from 'rxjs/operators'

import ComplexAnimation from './ComplexAnimation'
import PinterestLikeGrid from './PinterestLikeGrid'

const range = (x, y) =>
  Array(y - x)
    .fill(0)
    .map((_, i) => i + x)

const Circle = props$ => ({ mouse$ }) => {
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

const SimpleAnimation = () => (
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
)

const Lol = () => ({ mouse$ }) => (
  <p
    style={{
      fontSize: mouse$.pipe(ease({ x: [120, 18] }), map(m => m.x / 3 + 'px'))
    }}
  >
    LOL
  </p>
)

const App = () => (
  <div>
    <PinterestLikeGrid />
  </div>
)

export default App
