import { Subject } from 'rxjs'
import { scan, startWith, shareReplay } from 'rxjs/operators'

const createStore = (reducer, initialState, epic = x => x) => {
  const dispatcher = new Subject()
  const state = epic(dispatcher).pipe(
    scan(reducer, initialState),
    startWith(initialState),
    shareReplay(1)
  )

  return {
    dispatch: action => dispatcher.next(action),
    state
  }
}

export default createStore
