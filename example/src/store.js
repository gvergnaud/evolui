import createStore from './createStore'

const initialState = {
  text: '',
  todos: []
}

export default createStore(initialState, {
  updateText: text => () => ({ text }),

  addTodo: text => state => ({
    text: '',
    todos: state.todos.concat({
      isEditing: false,
      isComplete: false,
      id: state.todos.length,
      text
    })
  }),

  toggleTodo: id => state => ({
    todos: state.todos.map(
      todo =>
        todo.id === id
          ? {
              ...todo,
              isComplete: !todo.isComplete
            }
          : todo
    )
  }),

  toggleEditTodo: id => state => ({
    todos: state.todos.map(
      todo =>
        todo.id === id
          ? {
              ...todo,
              isEditing: !todo.isEditing
            }
          : todo
    )
  }),

  stopEditTodo: id => state => ({
    todos: state.todos.map(
      todo =>
        todo.id === id
          ? {
              ...todo,
              isEditing: false
            }
          : todo
    )
  }),

  updateTodo: ({ id, text }) => state => ({
    text: '',
    todos: state.todos.map(
      todo =>
        todo.id === id
          ? {
              ...todo,
              text: text
            }
          : todo
    )
  }),

  removeTodo: id => state => ({
    todos: state.todos.filter(todo => todo.id !== id)
  })
})
