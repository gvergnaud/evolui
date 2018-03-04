import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/shareReplay'

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
