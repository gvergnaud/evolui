import html from 'evolui'
import { Observable } from 'rxjs'

const mouse = Observable.fromEvent(window, 'mousemove')
  .map(e => ({
    x: e.clientX,
    y: e.clientY
  }))
  .startWith({ x: 0, y: 0 })

const MouseTracker = () => html`
  <div>
    <span>x: ${mouse.map(({ x }) => x)}</span>
    <span>y: ${mouse.map(({ y }) => y)}</span>
  </div>
`

export default MouseTracker
