import { Subject, BehaviorSubject } from 'rxjs'

const createStore = (reducer, initialState) => {
  const dispatcher = new Subject()
  const state = new BehaviorSubject()
  dispatcher
    .scan(reducer, initialState)
    .startWith(initialState)
    .subscribe(state)
  state.forEach(x => console.log(x))

  return {
    dispatch: action => dispatcher.next(action),
    state
  }
}

export default createStore
