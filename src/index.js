import { listen, html, render, handler } from './framework'
import { Observable, Subject } from 'rxjs'

var s = new Subject()
console.log(s)

const mouse$ = listen(window, 'mousemove')
  .map(({ clientX: x, clientY: y }) => ({ x, y }))
  .startWith({ x: 0, y: 0 })
  .takeUntil(Observable.timer(5000))

const Container = children => html`
  <div
    class="container"
    style="
      padding:20px;
      color:white;
      background-color: #444;
      position: absolute;
      transform: translate(${mouse$.map(x => x.x)}px, ${mouse$.map(x => x.y)}px);
    ">
    ${children}
  </div>
`

const Flex = children => html`
  <div style="display: flex; justify-content: space-between;">
    ${children}
  </div>
`
const Hello = name => html`<p>Hello, ${name}!</p>`

const Counter = () => {
  const subject = new Subject()
  const count = subject.scan(x => x + 1, 0).startWith(0)
  return html`
    <div>
      <span>${count}</span>
      <button onclick="${handler(() => subject.next())}">click me</button>
    </div>
  `
}

const App = html`
<div>
  ${Container([
    Flex([Hello('Gab'), Flex([Hello('Gab'), Flex([Hello('Gab'), Hello('Gabzor'), Counter()])])]),
    html`<h1>Je suis un titre</h1>`,
  ])}
  ${Counter()}
  ${Counter()}
</div>
`

render(App, document.querySelector('#root'))
