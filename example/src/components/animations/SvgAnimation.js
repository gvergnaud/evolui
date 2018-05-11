import html, { ease, all, createState } from 'evolui'
import { fromEvent } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

const window$ = fromEvent(window, 'resize').pipe(
  startWith(undefined),
  map(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }))
)

const mouse$ = fromEvent(window, 'mousemove').pipe(
  map(e => ({
    x: e.clientX,
    y: e.clientY
  })),
  startWith({ x: 0, y: 0 })
)

const SvgAnimation = () => {
  const state = createState({ elPosition: { x: 0, y: 0 } })

  const onMount = el => {
    const { left, top } = el.getBoundingClientRect()
    state.elPosition.set({ x: left, y: top })
  }

  const position$ = all([state.elPosition, mouse$]).pipe(
    map(([el, mouse]) => ({
      x: mouse.x - el.x,
      y: mouse.y - el.y
    }))
  )

  return html`
    <svg
      mount=${onMount}
      height="${window$.pipe(map(w => w.height))}"
      width="${window$.pipe(map(w => w.width))}">
      <circle
        cx="${position$.pipe(map(p => p.x), map(ease(120, 18)))}"
        cy="${position$.pipe(map(p => p.y), map(ease(120, 18)))}"
        r="40"
        fill="rgba(57, 77, 255)" />
    </svg>
  `
}

export default SvgAnimation
