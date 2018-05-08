import { Observable } from 'rxjs'
import html, { ease } from 'evolui'

const toPosition = e => {
  e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY }

  return e
}

const position$ = Observable.merge(
  Observable.fromEvent(window, 'mousemove').map(toPosition),
  Observable.fromEvent(window, 'touchmove').map(toPosition)
).startWith({ x: 0, y: 0 })

const Circle = props$ =>
  props$.map(
    ({ color = 'purple', radius = 25, stiffness = 120, damping = 20 } = {}) => {
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
              ${position$
                .map(p => p.x - radius)
                .switchMap(ease(stiffness, damping))}px,
              ${position$
                .map(p => p.y - radius)
                .switchMap(ease(stiffness, damping))}px
            );
          ">
        </div>
      `
    }
  )

export default () => html`
  <${Circle} radius=${35} color="rgb(5, 241, 163)" />
`
