import html, { ease } from 'evolui'
import { Observable } from 'rxjs'

const window$ = Observable.fromEvent(window, 'resize')
  .startWith(undefined)
  .map(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }))

const position$ = Observable.fromEvent(window, 'mousemove')
  .map(e => ({
    x: e.clientX,
    y: e.clientY
  }))
  .startWith({ x: 0, y: 0 })

const log = (x, label = '') => (console.log(label, x), x)
export default () => html`
  <svg
    height="${window$.map(w => w.height)}"
    width="${window$.map(w => w.width)}">
    <circle
      cx="${position$.map(p => p.x).map(ease(120, 18))}"
      cy="${position$.map(p => p.y).map(ease(120, 18))}"
      r="40"
      fill="rgba(57, 77, 255)" />
  </svg>
`
