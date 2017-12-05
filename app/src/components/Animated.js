import { Subject } from 'rxjs'
import html from '../html'
import {
  animate,
  fromTo,
  to,
  combineLatestStyles
} from '../animation-observable'
import { easeInOutQuart } from '../animation-observable/easings'

const frame$ = animate(2000)
  .map(easeInOutQuart)
  .startWith(0)

const toStyle = ({ x, scale }) =>
  `transform: scale(${scale}) translateX(${x}px);` +
  `background: black; width: 50px; height: 50px;`

const toggleSubject = new Subject()
const onToggle = () => toggleSubject.next()
const toggle = toggleSubject.scan(x => !x, false).startWith(false)

const animateIn = combineLatestStyles(
  frame$.map(fromTo(0, 200)).map(x => ({ x })),
  frame$.map(fromTo(0.5, 1)).map(scale => ({ scale }))
)

const animateOut = combineLatestStyles(
  frame$.do(x => console.log(x)).map(x => ({ x })),
  frame$.map(fromTo(1, 0.5)).map(scale => ({ scale }))
)

export default () => html`
<div onclick=${onToggle} style="${toggle
  .switchMap(x => (x ? animateOut : animateIn))
  .map(toStyle)}"></div>
`
