import html from 'evolui'
import store from '../store'

const Todo = ({ todo }) => {
  const onToggleComplete = () =>
    store.actions.toggleTodo(todo.id)

  const onStopEdit = () => store.actions.stopEditTodo(todo.id)

  const onToggle = () => store.actions.toggleEditTodo(todo.id)

  const onInput = e =>
    store.actions.updateTodo({ id: todo.id, text: e.target.value })


  const onKeyDown = e => {
    if (e.which === 13) onStopEdit()
  }

  const onRemove = () => store.actions.removeTodo(todo.id)

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
