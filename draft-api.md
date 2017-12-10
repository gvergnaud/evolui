stuff to handle

* local component state
* side effects, updates on global state -> a nice way to manage side effects, like drivers
* lifecycle

## lifecycle

what side effect methode is really useful ?

### update

if props are a stream, we could easily derive some state or side effects from them.
so update wouldn't be so useful.

### mount

hard to get around it. the function has to be called before anything was mounted
it is useful because we might want to use the dom api at this point for some reason.
We should provide a way to get dom nodes from our components

### unmount

at unsubscribtion of the observable defined by html ?

## state

```js
state({ count: 0 })
  .action('INC', state => ({ ...state, count: state.count + 1 }))
  .action('DEC', state => ({ ...state, count: state.count - 1 }));

state.dispatch({ type: 'INC' });
```

```js
const App = props$ => {
  const state$ = reducer((state, action) => {
      return state
  })

  return html`
    <div>
      ${state$.pluck('count')}
      ${}
    </div>
  `
}
```

```js
const App = props$ => {
  const state$ = reducer((state, action) => {
      return state
  })

  return html`
    <div>
      ${state$.pluck('count')}
      ${}
    </div>
  `
}
```

### props

```js
props$ => html`
  <div>
    ${pluck(props$).lol.lol.cool}
    ${props$.map(({ sub }) => sub)}
  </div>
`;
```

### side effects

Le bon de cycle :

* séparer les side effects dispo du reste du code

un provider qui lists les side effects

```js
{
  state: Observable -> Observable,
}

({ state }) => {
return html`
  <div>
  <Trello ${props}>

  </Trello>
  </div>
`
}
```
