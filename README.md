# evolui

A `8kb` reactive user interface library.

Evolui magically understands Observable and Promises and takes care of refreshing your UI when they emit new values.
You can only care about where the data should be displayed.

## Install

```
npm install evolui
```

## Examples

* All examples [Demo](https://7yv1494p9x.codesandbox.io/) — [see code](https://codesandbox.io/s/github/gvergnaud/evolui/tree/master/example)
* Simple Animation [Demo](https://72wkn61x21.codesandbox.io/) — [see code](https://codesandbox.io/s/72wkn61x21)
* Complexe Animation [Demo](https://31z431n4m.codesandbox.io/) — [see code](https://codesandbox.io/s/31z431n4m)
* Animated Pinterest Like Grid [Demo](https://wqyl0xmo47.codesandbox.io/) — [see code](https://codesandbox.io/s/wqyl0xmo47)

**To jump to the code, visite the [`example`](https://github.com/gvergnaud/evolui/tree/master/example) folder.**

### Promises

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

### Observables

```js
import html, { render } from 'evolui'
import { Observable } from 'rxjs'

render(
  html`
    <p>
      Hello, ${Observable.interval(1000)
        .take(4)
        .map(index => ['.', '..', '...', 'World!'][index])}
    </p>
  `,
  document.body
)
```

![Observable demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-2.gif?raw=true)

## Concept

The main goal of evolui is to make dealing with observables as easy as dealing with regular values.

Observables are a great way to represent values that change over time. The hard part though is combining them. This is where evolui comes in handy. It understands **any** combination of `Array`s, `Promise`s and `Observable`s, so you never have to worry about the way you should combine them before putting them inside your template.

```js
const getCharacterName = id =>
  fetch(`https://swapi.co/api/people/${id}`)
    .then(res => res.json())
    .then(character => character.name)

html`
  <div>
    ${'' /* this will return an array of observables. */}
    ${'' /* Don't panic! evolui understands that as well */}
    ${[1, 2, 3].map(
      id => html`
      <h1>${Observable.fromPromise(getCharacterName(id)).startWith(
        'Loading...'
      )}</h1>
    `
    )}
  </div>
`
```

![list demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-3.gif?raw=true)

## Components

Evolui lets you organize your code in components.

Components are defined as a simple function of `Observable Props -> Observable VirtualDOM`:

```js
import html, { createState, render } from 'evolui'

const Button = props$ =>
  props$.map(
    ({ text, onClick }) => html`
      <button class="Button" onClick=${onClick}>
          ${text}
      </button>
    `
  )

const App = () => {
  const state = createState({ count: 0 })

  return html`
    <div>
      <${Button}
        text="-"
        onClick=${() => state.count.set(c => c - 1)}
      />

      count: ${state.count}

      <${Button}
        text="+"
        onClick=${() => state.count.set(c => c + 1)}
      />
    </div>
  `
}

render(App(), document.body)
```

## Animations

Evolui exports a **spring** animation helper called ease.

```typescript
ease: (stiffness: number, damping: number) => number => Observable<number>
```

You just have to add `.switchMap(ease(<stiffness>, <damping>))` to any of your observable to make it animated.

```js
import html, { render, ease } from 'evolui'
import { Observable } from 'rxjs'

const position$ = new Observable(observer => {
  observer.next({ x: 0, y: 0 })
  window.addEventListener('click', e => {
    observer.next({ x: e.clientX, y: e.clientY })
  })
})

render(
  html`
    <div
      class="circle"
      style="transform: translate(
        ${position$.map(m => m.x).switchMap(ease(120, 18))}px,
        ${position$.map(m => m.y).switchMap(ease(120, 18))}px
      );"
    />
  `,
  document.body
)
```

![animation demo](https://raw.githubusercontent.com/gvergnaud/evolui/c445de8161c151c24d84d0ad61af0a6185f0d62d/dot-animation.gif)

## API

#### text :: TemplateLiteral -> Observable String

```js
import { text } from 'evolui'

const style$ = text`
  position: absolute;
  transform: translate(${x$}px, ${y$}px);
`
```

#### html :: TemplateLiteral -> Observable VirtualDOM

```js
import html from 'evolui'

const App = () => html`
  <div style="${style$};" />
`
```

#### render :: Observable VirtualDOM -> DOMNode -> ()

```js
import { render } from 'evolui'

render(App(), document.body)
```

### ease :: (Number, Number) -> Observable Number -> Observable Number

```js
import { ease } from 'evolui'
import { Observable } from 'rxjs'

Observable.interval(1000)
  .switchMap(ease(120, 20))
  .forEach(x => console.log(x)) // every values will be interpolated
```

### createState :: Object -> State

Create an object of mutable reactive values.

Each key on your initial state will be transformed into a stream, with a special `set` method on it.
`set` can take either a value or a mapper function.

```js
import html, { createState, render } from 'evolui'

const state = createState({ count: 0 })

console.log(state.count)
// => Observable.of(0)

const reset = () => state.count.set(0)
const add1 = () => state.count.set(c => c + 1)

render(
  html`
    <div>
      count: ${state.count}
      <button onClick=${reset}>reset</button>
      <button onClick=${add1}>+</button>
    </div>
  `,
  document.body
)
```

### all :: [Observable a] -> Observable [a]

```js
import { all } from 'evolui'

const z$ = all([x$, y$]).map(([x, y]) => x + y)
```

### Lifecycle

* **mount** — after the element as been rendered
* **update** — after the dom element as been update
* **unmount** — before the dom element is removed from the dom

```js
html`
  <div
    mount="${el => console.log('mounted!', el)}"
    update="${el => console.log('updated', el)}"
    unmount="${el => console.log('will unmount!', el)}" />
`
```

## Contributing

If you find this interesting and you want to contribute, don't hesitate to open an issue or to reach me out on twitter [@GabrielVergnaud](https://twitter.com/GabrielVergnaud)!
