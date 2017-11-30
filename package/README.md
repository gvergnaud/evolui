# Evolui
A reactive template library

## Installation

```
npm install evolui
```


## Usage

To use evolui, just pass it the instance of `Observable` you use.
It should be complient with the [Observable ecmascript proposal](https://github.com/tc39/proposal-observable) (most library are).


```js
import Observable from 'rxjs'
import evolui, { render } from 'evolui'

const html = evolui(Observable)
render(html`<h1>Hello, World!</h1>`, document.body)
```

## Examples

### Mouse tracker
```js
import evolui, { render } from 'evolui'
import { Observable } from 'rxjs'

const html = evolui(Observable)

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

### Simple chat app
```js
import io from 'socket.io-client'
import { Observable } from 'rxjs'
import evolui, { render } from 'evolui'

const html = evolui(Observable)

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
