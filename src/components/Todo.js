import {html} from '../framework'
import store, {UPDATE_TODO, TOGGLE_EDIT_TODO, REMOVE_TODO} from '../store'

const Todo = ({ todo }) => {
  const onToggle = () => store.dispatch({ type: TOGGLE_EDIT_TODO, id: todo.id })

  const onInput = e => {
    store.dispatch({ type: UPDATE_TODO, id: todo.id, text: e.target.value })
  }

  const onKeyDown = e => {
    if (e.which === 13) onToggle()
  }

  const onRemove = () => store.dispatch({ type: REMOVE_TODO, id: todo.id })

  return html`
    <li>
      ${
        todo.isEditing
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
      <button onclick=${onRemove}>X</button>
    </li>
  `
}

export default Todo
