import html from 'evolui'
import { fromEvent } from 'rxjs'
import { map, share } from 'rxjs/operators'

const MouseTracker = () => {
  const mouse = fromEvent(window, 'mousemove').pipe(
    map(e => ({ x: e.clientX, y: e.clientY })),
    share()
  )

  return html`
    <div>
      <span>x: ${mouse.pipe(map(({ x }) => x))}</span>
      <span>y: ${mouse.pipe(map(({ y }) => y))}</span>
    </div>
  `
}

export default MouseTracker
