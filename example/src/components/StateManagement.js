import html from 'evolui'
import { Observable, Subject } from 'rxjs'
import createStore from '../createStore'


const { actions, state$, state } = createStore(
  { count: 0, user: { name: 'gabriel' } },
  {
    asyncAdd: () => (_, actions) => setTimeout(actions.add, 1000),
    add: () => state => ({ count: state.count + 1 }),
    sub: () => state => ({ count: state.count - 1 }),
    changeName: e => state => ({ user: { name: e.target.value } })
  }
)

const App = props => html`
  <div>
    <button onclick="${actions.asyncAdd}">async +</button>
    <button onclick="${actions.add}">+</button>
    <span>${state.count.$}</span>
    <button onclick="${actions.sub}">-</button>
    <input value="${state.user.name.$}" oninput="${actions.changeName}" />
    <p>Hello, my name is ${state.user.name.$}</p>
    <p>${props.test}</p>
  </div>
`

// problem of this way compared to intent -> model -> view of cyle is that
// it doesn't make creating actions based on combination of event as easy.

// I like the concept of `intent` because it separates the dom api from the actual
// intent of the user.
//

const App2 = () => {
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
    </div>
  `
}

const App3 = () => {
  const createSourceProxy = () => new Proxy({}, {
    get(obj, key) {
      return obj[key] ? obj[key] : obj[key] = new Subject()
    }
  })

  const mapping = map => {
    const sources = createSourceProxy()
    return {
      sources,
      sinks: map(sources)
    }
  }

  const {sources, sinks} = mapping(sources => ({
    add: sources.add.merge(sources.asyncAdd.flatMap(() => Observable.timeout(1000))),
    sub: sources.sub,
    changeName: sources.changeName,
  }))

  const initialState = {
    count: 1,
    name: 'gabriel'
  }

  const state = Observable.merge(
    sinks.add.map(() => state => ({ count: state.count + 1 })),
    sinks.sub.map(() => state => ({ count: state.count - 1 })),
    sinks.changeName.map(name => () => ({ name })),
  )
    .startWith(x => x)
    .scan((state, f) => {
      const nextState = f(state)
      return {...state, ...nextState}
    }, initialState)
    .shareReplay(1)


  // this could be called only once statically. state would be an object of observables
  return html`
    <div>
      <button onclick="${sources.asyncAdd}">async +</button>
      <button onclick="${sources.add}">+</button>
      <span>${state.map(s => s.count)}</span>
      <button onclick="${sources.sub}">-</button>
      <input value="${state.map(s => s.name)}" oninput="${sources.changeName}" />
      <p>Hello, my name is ${state.map(s => s.name)}</p>
    </div>
  `
}

export default App
