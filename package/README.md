# Evolui
An asynchronous template library

A template library that magically understand Promises and Observables.

## Promises
```js
import html, { render } from 'evolui'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

render(
  html`
    <p>
      Hello, ${
        delay(1000).then(() => 'World!')
      }
    </p>
  `,
  document.body
)
```
This works with native promises and any A+ compliant promise library.

## Observables
```js
render(
  html`
    <p>
      Hello, ${
        Observable.interval(1000)
          .take(4)
          .map(index => ['.', '..', '...', 'World!'][index])
      }
    </p>
  `,
  document.body
)
```


## Installation

```
npm install evolui
```


## Some more interesting examples

### Mouse tracker
```js
import html, { render } from 'evolui'
import { Observable } from 'rxjs'

const mouse = new Observable(observer => {
  observer.next({ x: 0, y: 0 })
  window.addEventListener('mousemove', e => {
    observer.next({ x: e.clientX, y: e.clientY })
  })
})

render(
  html`
    <div>
      <p>Mouse position: </p>
      <p>x: ${mouse.map(({ x }) => x)}</p>
      <p>y: ${mouse.map(({ y }) => y)}</p>
    </div>
  `,
  document.querySelector('#root')
)
```

### A simple chat app
```js
import io from 'socket.io-client'
import { Observable } from 'rxjs'
import html, { render } from 'evolui'

const socket = io('https://chat-server-dkkxygrves.now.sh')

const message$ = new Observable(observer => {
  socket.on('message', message => observer.next(message))
})
const sendMessage = message => socket.emit('message', message)

const Chat = () => {
  const onKeyDown = ({ which, target }) => {
    if (which === 13) {
      sendMessage(target.value)
      target.value = ''
    }
  }

  return html`
    <div>
      <input onkeydown=${onKeyDown} />
      <div>
        ${message$
          .scan((acc, x) => [...acc, x], [])
          .map(messages => messages.map(message => html`<p>${message}</p>`))}
      </div>
    </div>
  `
}

render(Chat(), document.querySelector('#root'))
```
