import html from 'evolui'
import { ease } from 'evolui/extra'
import { merge, fromEvent } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { addPosition } from '../../utils'

const Circle = props$ => {
  const position$ = merge(
    fromEvent(window, 'mousemove').pipe(map(addPosition), map(e => e.position)),
    fromEvent(window, 'touchmove').pipe(map(addPosition), map(e => e.position))
  ).pipe(startWith({ x: 0, y: 0 }))

  return props$.pipe(
    map(
      ({ color = 'purple', radius = 25, stiffness = 120, damping = 20 } = {}) =>
        html`
          <div
            style=${position$.pipe(
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
            )}>
          </div>
        `
    )
  )
}

export default () => html`
  <${Circle} radius=${35} color="rgb(5, 241, 163)" />
`
