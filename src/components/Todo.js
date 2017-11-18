import html from '../html'
import store, {
  UPDATE_TODO,
  TOGGLE_EDIT_TODO,
  STOP_EDIT_TODO,
  REMOVE_TODO,
  TOGGLE_TODO
} from '../store'

const Todo = ({ todo }) => {
  const onToggleComplete = () =>
    store.dispatch({ type: TOGGLE_TODO, id: todo.id })

  const onStopEdit = () => store.dispatch({ type: STOP_EDIT_TODO, id: todo.id })

  const onToggle = () => store.dispatch({ type: TOGGLE_EDIT_TODO, id: todo.id })

  const onInput = e => {
    store.dispatch({ type: UPDATE_TODO, id: todo.id, text: e.target.value })
  }

  const onKeyDown = e => {
    if (e.which === 13) onStopEdit()
  }

  const onRemove = () => store.dispatch({ type: REMOVE_TODO, id: todo.id })

  return html`
    <li>
      ${
        todo.isEditing
          ? html`
              <input
                autofocus
                value="${todo.text}"
                oninput=${onInput}
                onkeydown=${onKeyDown}
                onblur=${onStopEdit} />
            `
          : html`
              <span
                ondblclick=${onToggle}
                onclick=${onToggleComplete}
                style="text-decoration: ${
                  todo.isComplete ? 'line-through' : 'none'
                };">
                ${todo.text}
                </span>
            `
      }
      <button onclick=${onRemove}>X</button>
    </li>
  `
}

export default Todo
