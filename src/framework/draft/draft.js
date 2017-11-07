/* ----------------------------------------- *
        Reactive architecture
* ----------------------------------------- */
// simple, petite surface d'API

import { Subject } from 'rxjs'

const action$ = new Subject()

const history$ = action$.scan((acc, a) => acc.concat(a), [])
// avoir des producers de data par action. penser son state comme une
// composition d'un reducer par action (ou par entité logique ? vraisemblablement moins limitant)
// et créer des accesseurs composables

// h :: TagName -> Properties -> Children -> VirtualDOM
const h = () => ({})

// O :: ((a -> ()) -> a) -> Obserbable a
const O = () => ({})

// O transform une datastructure contenant des observable en Observable contenant
// la datastructure. Ça permet de templater facilement n'importe quoi et de le
// rendre reactif. Facilement

const virtualDOMStream = O(o =>
  h('div', [
    o(history$.map(actions => actions.map(a => h('p', a.type))))
  ])
)

/* ----------------------------------------- *
        Le state object
* ----------------------------------------- */

// Pourquoi lorsqu'on crée un nouveau bout de state, nous devrions aussi créer un getter ?
// c'est le même effort pourtant, le getter est determiné par la forme du state
// Objectif est de créer un arbre de state ou lorsqu'on crée une nouvelle branche,
// on crée aussi un accesseur composable avec d'autres accesseurs. En fait que ce soit
// un getter/setter, une lens pour ainsi dire. Donc il faut qu'il suive la data structure
// et qu'il soit facile à utiliser.

// un bout de state accessible globalement en lecture mais pas en écriture

// State a :: { get:: () -> a, dispatch: Action -> (), create :: create }
// create :: (a -> b -> a) -> a -> State a


const state = createState((state, action) => state, {})

state.get()
// => {}

const nameState = state.create('name', (state, action) => state, 'Gabriel')
nameState.dispatch({ type: 'a' })


// composable state


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
