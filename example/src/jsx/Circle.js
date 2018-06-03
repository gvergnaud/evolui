import { h } from 'evolui'
import { ease } from 'evolui/extra'
import { map } from 'rxjs/operators'
import { mouse$ } from '../context'

const range = (x, y) =>
  Array(y - x)
    .fill(0)
    .map((_, i) => i + x)

export const Circle = props$ => {
  const style$ = props$.pipe(
    map(
      ({
        key,
        color = `rgba(5, 241, 163, 1)`,
        radius = 35,
        stiffness = 150,
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

const SimpleAnimation = () =>
  range(0, 10).map(i => (
    <Circle
      key={i}
      stiffness={100 + i * 20}
      damping={16}
      radius={35}
      color={`rgba(5, 241, 163, ${i / 10})`}
    />
  ))

export default SimpleAnimation
