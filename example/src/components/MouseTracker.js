import html from 'evolui'
import { listen } from '../utils/observables'

const mouse = listen(window, 'mousemove')
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
