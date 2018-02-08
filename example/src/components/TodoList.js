import html from 'evolui'
import Todo from './Todo'

const TodoList = ({ todos }) => html`
  <ul>
    ${todos.map(todo => Todo({ todo }))}
  </ul>
`

export default TodoList
