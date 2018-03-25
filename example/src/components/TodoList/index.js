import html from 'evolui'
import InputBar from './InputBar'
import TodoList from './TodoList'
import configureStore, { ADD_TODO, UPDATE_TEXT } from './configureStore'

const TodoApp = () => {
  const store = configureStore()

  return html`
    <div>
      ${InputBar({ store })}
      ${store.state
        .pluck('todos')
        .distinctUntilChanged()
        .switchMap(todos => TodoList({ todos, store }))}
    </div>
  `
}

export default TodoApp
