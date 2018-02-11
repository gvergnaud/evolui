# Evolui

⚠️ this is experimental! ⚠️

A template library that magically understands Promises and Observables.

Evolui leverages template tags to automatically manage your observable subscriptions, so you only care about where the data should be displayed.

## Promises
```js
import html, { render } from 'evolui'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

render(
  html`
    <p>
      Hello, ${delay(1000).then(() => 'World!')}
    </p>
  `,
  document.body
)
```
![Promise demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-1.gif?raw=true)

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
![Observable demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-2.gif?raw=true)

## Installation

```
npm install --save evolui
```


## Concept
The main goal of evolui is to make dealing with observables as easy as dealing with regular values.

Observables are a great way to represent values that change over time. The hard part though is combining them and managing subscriptions. This is where evolui comes in handy. Evolui understand **any** combination of `Array`s, `Promise`s and `Observable`s, so you never have to worry on the way you should combine them before putting them inside your template.

```js
html`
  <div>
    ${''/* this will return an array of observables. */}
    ${''/* Don't panic! evolui understands that as well */}
    ${[1,2,3].map(id => html`
      <h1>${
        Observable.fromPromise(fetch(`https://swapi.co/api/people/${id}`)
          .then(res => res.json())
          .then(character => character.name))
          .startWith('Loading...')
      }</h1>
    `)}
  </div>
`
```
![list demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-3.gif?raw=true)

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
![mouse demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-4.gif?raw=true)

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
![chat demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-5.gif?raw=true)

## Contributing
If you find this interesting and you want to contribute, don't hesitate to open an issue or to reach me out on twitter [@GabrielVergnaud](https://twitter.com/GabrielVergnaud)!
