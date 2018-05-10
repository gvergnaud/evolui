import { Subject, merge } from 'rxjs'
import { scan, startWith, shareReplay, map } from 'rxjs/operators'
import { mapValues } from './utils/objects'

const createActions = actionMappers => {
  const actions = mapValues(mapper => {
    const sub = new Subject()
    const action = x => sub.next(x)
    action.createStream = getState => mapper(sub, getState)
    return action
  }, actionMappers)

  const foldState = (initialState, reducers) => {
    let state = initialState

    const getState = () => state
    const getReducer = k => reducers[k] || (x => x)

    const actionStreams = Object.entries(actions).map(([key, action]) => {
      const reducer = getReducer(key)
      return action
        .createStream(getState)
        .pipe(map(value => state => reducer(state, value)))
    }, actions)

    return merge(...actionStreams).pipe(
      scan((prevState, f) => {
        state = { ...prevState, ...f(prevState) }
        return state
      }, initialState),
      startWith(initialState),
      shareReplay(1)
    )
  }

  return { ...actions, foldState }
}

export default createActions
