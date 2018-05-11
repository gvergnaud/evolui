import html, { ease } from 'evolui'
import { merge, fromEvent } from 'rxjs'
import { map, switchMap, startWith } from 'rxjs/operators'
import { addPosition } from '../../utils'

const Circle = props$ => {
  const position$ = merge(
    fromEvent(window, 'mousemove').pipe(map(addPosition), map(e => e.position)),
    fromEvent(window, 'touchmove').pipe(map(addPosition), map(e => e.position))
  ).pipe(startWith({ x: 0, y: 0 }))

  return props$.pipe(
    map(
      ({
        color = 'purple',
        radius = 25,
        stiffness = 120,
        damping = 20
      } = {}) => {
        return html`
          <div
            style="
              position: absolute;
              left: 0;
              top: 0;
              width: ${radius * 2}px;
              height: ${radius * 2}px;
              background: ${color};
              border-radius: 100%;
              z-index: -1;
              transform: translate(
                ${position$.pipe(
                  map(p => p.x - radius),
                  switchMap(ease(stiffness, damping))
                )}px,
                ${position$.pipe(
                  map(p => p.y - radius),
                  switchMap(ease(stiffness, damping))
                )}px
              );
            ">
          </div>
        `
      }
    )
  )
}

export default () => html`
  <${Circle} radius=${35} color="rgb(5, 241, 163)" />
`
