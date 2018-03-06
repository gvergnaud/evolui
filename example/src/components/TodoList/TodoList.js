import html from 'evolui'
import Todo from './Todo'

const TodoList = ({ todos, store }) => html`
  <ul>
    ${todos.map(todo => Todo({ todo, store }))}
  </ul>
`

export default TodoList
