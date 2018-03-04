import html from 'evolui'
import InputBar from './InputBar'
import TodoList from './TodoList'
import store from './store'

const TodoApp = () => html`
  <div>
    ${InputBar()}
    ${store.state.switchMap(({ todos }) => TodoList({ todos }))}
  </div>
`

export default TodoApp
