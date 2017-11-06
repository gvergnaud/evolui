import { html, render, listen, createStore } from './framework'
import { Observable } from 'rxjs'

// const mouse$ = listen(window, 'mousemove')
//   .map(({ clientX: x, clientY: y }) => ({ x, y }))
//   .startWith({ x: 0, y: 0 })

const initialState = {
  text: '',
  todos: [],
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_TEXT':
      return {
        ...state,
        text: action.text,
      }
    case 'ADD_TODO':
      return {
        ...state,
        text: '',
        todos: state.todos.concat({
          isEditing: false,
          id: state.todos.length,
          text: action.text,
        }),
      }

    case 'TOGGLE_EDIT_TODO':
      return {
        ...state,
        todos: state.todos.map(
          todo =>
            todo.id === action.id
              ? {
                  ...todo,
                  isEditing: !todo.isEditing,
                }
              : todo
        ),
      }
    case 'UPDATE_TODO':
      return {
        ...state,
        text: '',
        todos: state.todos.map(
          todo =>
            todo.id === action.id
              ? {
                  ...todo,
                  text: action.text,
                }
              : todo
        ),
      }
    default:
      return state
  }
}

const store = createStore(reducer, initialState)


const mouse = listen(window, 'mousemove')
  .map(e => ({
    x: e.clientX,
    y: e.clientY
  }))
  .startWith({ x: 0, y: 0 })


const MouseTracker = () => html`
  <div>
    <span>x: ${mouse.map(({ x }) => x)}</span>
    <span>y: ${mouse.map(({ y }) => y)}</span>
  </div>
`

const InputBar = () => {
  const onKeyDown = e => {
    if (e.which === 13) store.dispatch({ type: 'ADD_TODO', text: e.target.value })
  }

  const onInput = e => store.dispatch({ type: 'UPDATE_TEXT', text: e.target.value })

  return html`
    <input
      value="${store.state.map(({ text }) => text)}"
      oninput=${onInput}
      onkeydown=${onKeyDown} />
  `
}

const Ticker = () => Observable.interval(1000).startWith(0).switchMap(n => html`<span>${n}</span>`)

const Todo = ({ todo }) => {
  const onToggle = () => store.dispatch({ type: 'TOGGLE_EDIT_TODO', id: todo.id })

  const onInput = e => {
    store.dispatch({ type: 'UPDATE_TODO', id: todo.id, text: e.target.value })
  }

  const onKeyDown = e => {
    if (e.which === 13) onToggle()
  }

  return html`
    <li>
      ${todo.isEditing
        ? html`
            <input
              value="${todo.text}"
              oninput=${onInput}
              onkeydown=${onKeyDown} />
          `
        : html`
            <span onclick=${onToggle}>${todo.text}</span>
          `
      }
    </li>
  `
}

const TodoList = ({ todos }) => html`
  <ul>
    ${todos.map(todo => Todo({ todo }))}
  </ul>
`

const App = () => html`
  <div>
    ${Ticker()}
    ${InputBar()}
    ${MouseTracker()}
    ${store.state.switchMap(({ todos }) => TodoList({ todos }))}
  </div>
`

const range = n => (n === 0 ? [n] : [n, ...range(n - 1)])

render(App(), document.querySelector('#root'))
