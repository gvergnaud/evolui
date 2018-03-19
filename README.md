# evolui

A `8kb` template library that magically understands Promises and Observables.

Evolui takes care of refreshing your UI when promises and observables emit new values.
You can only care about where the data should be displayed.

⚠️ this is experimental! ⚠️

## Get it

```
npm install --save evolui
```

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

Observables are a great way to represent values that change over time. The hard part though is combining them and managing subscriptions. This is where evolui comes in handy. Evolui understand **any** combination of `Array`s, `Promise`s and `Observable`s, so you never have to worry on the way you should combine them before putting them inside your template.

```js
html`
  <div>
    ${'' /* this will return an array of observables. */}
    ${'' /* Don't panic! evolui understands that as well */}
    ${[1, 2, 3].map(
      id => html`
      <h1>${Observable.fromPromise(
        fetch(`https://swapi.co/api/people/${id}`)
          .then(res => res.json())
          .then(character => character.name)
      ).startWith('Loading...')}</h1>
    `
    )}
  </div>
`
```

![list demo](https://github.com/gvergnaud/evolui/blob/media/gifs/evolui-3.gif?raw=true)

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
    <div>
      <div
        class="circle"
        style="transform: translate(
          ${position$.map(m => m.x).switchMap(ease(120, 18))}px,
          ${position$.map(m => m.y).switchMap(ease(120, 18))}px
        );" />
    </div>
  `,
  document.body
)
```

![animation demo](https://raw.githubusercontent.com/gvergnaud/evolui/c445de8161c151c24d84d0ad61af0a6185f0d62d/dot-animation.gif)

## More examples

* Simple Animation [Demo](https://72wkn61x21.codesandbox.io/) — [see code](https://codesandbox.io/s/72wkn61x21)
* Complexe Animation [Demo](https://31z431n4m.codesandbox.io/) — [see code](https://codesandbox.io/s/31z431n4m)
* Animated Pinterest Like Grid [Demo](https://wqyl0xmo47.codesandbox.io/) — [see code](https://codesandbox.io/s/wqyl0xmo47)

**To see more example, visite the [`example`](https://github.com/gvergnaud/evolui/tree/master/example) folder.**

## Contributing

If you find this interesting and you want to contribute, don't hesitate to open an issue or to reach me out on twitter [@GabrielVergnaud](https://twitter.com/GabrielVergnaud)!
