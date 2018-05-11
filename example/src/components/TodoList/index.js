import html from 'evolui'
import { map } from 'rxjs/operators'
import InputBar from './InputBar'
import TodoList from './TodoList'
import configureStore from './configureStore'
import { ADD_TODO, UPDATE_TEXT } from './actions'

const TodoApp = () => {
  const store = configureStore()
  return html`
    <div>
      <${InputBar}
        value=${store.state.pipe(map(({ text }) => text))}
        onChange=${text => store.dispatch({ type: UPDATE_TEXT, text })}
        onSubmit=${text => store.dispatch({ type: ADD_TODO, text })}
      />
      <${TodoList} store=${store} />
    </div>
  `
}

export default TodoApp
