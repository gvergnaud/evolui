import html from 'evolui'
import { fromEvent } from 'rxjs'
import { scan } from 'rxjs/operators'

export default () => {
  const strokeWidth$ = fromEvent(window, 'click').pipe(scan(a => a + 1, 1))

  return html`
    <svg width="100" height="100">
      <path stroke-width=${strokeWidth$} stroke=black d="M 0 0 L 50 50" />
      <path stroke-width=${strokeWidth$} stroke=black d="M 0 50 L 50 0" />
    </svg>
  `
}
