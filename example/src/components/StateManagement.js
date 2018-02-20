import html from 'evolui'
import { Observable, Subject } from 'rxjs'

const isObject = x => typeof x === 'object' && !Array.isArray(x)

const proxy = state$ => new Proxy({}, {
  get(obj, prop) {
    return prop === '$' ? state$.distinctUntilChanged() : proxy(state$.map(s => s[prop]))
  }
})

const createStore = (initialState, actions) => {
  const action$ = new Subject()

  const boundActions =
    Object.entries(actions)
      .reduce((acc, [k, f]) => ({
        ...acc,
        [k]: (...args) => action$.next(f(...args))
      }), {})

  const state$ =
    action$
      .startWith(x => x)
      .scan((state, f) => {
        const nextState = f(state, boundActions)
        return isObject(nextState) ? {...state, ...nextState} : state
      }, initialState)
      .shareReplay(1)

  return {
    actions: boundActions,
    state$,
    state: proxy(state$)
  }
}


const { actions, state$, state } = createStore(
  { count: 0, user: { name: 'gabriel' } },
  {
    asyncAdd: () => (_, actions) => setTimeout(actions.add, 1000),
    add: () => state => ({ count: state.count + 1 }),
    sub: () => state => ({ count: state.count - 1 }),
    changeName: e => state => ({ user: { name: e.target.value } })
  }
)

const App = html`
  <div>
    <button onclick="${actions.asyncAdd}">async +</button>
    <button onclick="${actions.add}">+</button>
    <span>${state.count.$}</span>
    <button onclick="${actions.sub}">-</button>
    <input value="${state.user.name.$}" oninput="${actions.changeName}" />
    <p>Hello, my name is ${state.user.name.$}</p>
  </div>
`

export default App


// problem of this way compared to intent -> model -> view of cyle is that
// it doesn't make creating actions based on combination of event as easy.

// I like the concept of `intent` because it separates the dom api from the actual
// intent of the user.
//

const App2 = props => {
  const intents = actions => ({
    add: actions.add.merge(actions.asyncAdd.flatMap(() => Observable.timeout(1000))),
  })

  const initialState = {
    count: 1,
    name: 'gabriel'
  }

  const {state, actions} = createStore(initialState, intents, {
    add: () => state => ({ count: state.count + 1 }),
    sub: () => state => ({ count: state.count - 1 }),
    changeName: name => () => ({ name }),
  })

  // this could be called only once statically. state would be an object of observables
  return html`
    <div>
      <button onclick="${actions.asyncAdd}">async +</button>
      <button onclick="${actions.add}">+</button>
      <span>${state.count}</span>
      <button onclick="${actions.sub}">-</button>
      <input value="${state.name}" oninput="${actions.changeName}" />
      <p>Hello, my name is ${state.name}</p>
      <p>${props.test}</p>
    </div>
  `
}
