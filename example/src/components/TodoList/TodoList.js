import html from 'evolui'
import Todo from './Todo'
import {
  UPDATE_TODO,
  TOGGLE_EDIT_TODO,
  STOP_EDIT_TODO,
  REMOVE_TODO,
  TOGGLE_TODO
} from './actions'

const TodoList = props$ =>
  props$.map(({ store }) => {
    return html`
      <ul>
        ${store.state
          .pluck('todos')
          .distinctUntilChanged()
          .map(todos =>
            todos.map(
              todo =>
                html`<${Todo} ${{
                  key: todo.text,
                  todo,
                  onToggleComplete: () =>
                    store.dispatch({ type: TOGGLE_TODO, id: todo.id }),
                  onStopEdit: () =>
                    store.dispatch({ type: STOP_EDIT_TODO, id: todo.id }),
                  onToggle: () =>
                    store.dispatch({ type: TOGGLE_EDIT_TODO, id: todo.id }),
                  onInput: e =>
                    store.dispatch({
                      type: UPDATE_TODO,
                      id: todo.id,
                      text: e.target.value
                    }),
                  onRemove: () =>
                    store.dispatch({ type: REMOVE_TODO, id: todo.id })
                }} />`
            )
          )}
      </ul>
    `
  })

export default TodoList
