import { Subject } from 'rxjs'

const createStore = (reducer, initialState, epic = x => x) => {
  const dispatcher = new Subject()
  const state = epic(dispatcher)
    .scan(reducer, initialState)
    .startWith(initialState)
    .shareReplay(1)
  state.forEach(x => console.log(x))

  return {
    dispatch: action => dispatcher.next(action),
    state
  }
}

export default createStore
