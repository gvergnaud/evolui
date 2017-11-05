


const mapValues = (mapper, obj) =>
  Object.keys(obj).reduce((acc, k) => ({ [k]: mapper(obj[k], k) }), {})

const action = type => {
  function create(payload) {
    return { type, payload }
  }

  create.toString = () => type

  return create
}

const handle = obj => action =>
  obj[action.type] ? obj[action.type](action.payload) : obj.otherwise()



const shape = obj => {
  let state = {}
  const listeners = []

  const dispatch = action => {
    Object.entries(obj).forEach(
      ([k, f]) => {
        state[k] = f(state[k])(action)
      },
      obj
    )

    listeners.forEach(l => l())
  }

  dispatch({ name: 'init' })

  return {
    getState: () => state,
    dispatch,
    subscribe: (l) => {
      listeners.push(l)
      return () => {
        listeners = listeners.filter(x => x !== l)
      }
    }
  }
}

const Increment = action('Increment')
const Decrement = action('Decrement')
const ChangeName = action('ChangeName')

const state = shape({
  name: (name = 'Gabriel') => handle({
    [ChangeName]: newName => newName,
    otherwise: () => name
  }),
  count: (count = 0) => handle({
    [Increment]: value => count + value,
    [Decrement]: value => count - value,
    otherwise: () => count
  })
})

state.subscribe(() => console.log(state.getState()))

state.dispatch(Increment(2))
state.dispatch(Increment(2))
state.dispatch(Increment(2))
state.dispatch(Increment(2))
state.dispatch(Increment(1))
state.dispatch(ChangeName('Gabz'))
