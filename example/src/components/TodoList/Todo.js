import html from 'evolui'

const Todo = props$ => {
  return props$.map(
    ({ todo, onToggleComplete, onStopEdit, onToggle, onInput, onRemove }) => {
      const onKeyDown = e => {
        if (e.which === 13) onStopEdit()
      }

      return html`
      <li
        mount="${() => console.log('todo created!', todo.text)}"
        update="${() => console.log('todo updated!', todo.text)}"
        unmount="${() => console.log('todo removed ;(', todo.text)}">
        ${
          todo.isEditing
            ? html`
                <input
                  autofocus
                  value="${todo.text}"
                  onInput="${onInput}"
                  onKeyDown="${onKeyDown}"
                  onBlur="${onStopEdit}" />
              `
            : html`
                <span
                  onClick="${onToggleComplete}"
                  style=${{
                    textDecoration: todo.isComplete ? 'line-through' : 'none'
                  }}>
                  ${todo.text}
                </span>
              `
        }
        <button onclick=${onRemove}>X</button>
        <button onclick=${onToggle}>Edit</button>
      </li>
    `
    }
  )
}

export default Todo
