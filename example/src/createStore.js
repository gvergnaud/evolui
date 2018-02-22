import { Subject } from 'rxjs'

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

export default createStore
