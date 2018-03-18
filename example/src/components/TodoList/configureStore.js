import createStore from '../../createStore'

import {
  UPDATE_TEXT,
  ADD_TODO,
  TOGGLE_EDIT_TODO,
  STOP_EDIT_TODO,
  TOGGLE_TODO,
  UPDATE_TODO,
  REMOVE_TODO
} from './actions'

const initialState = {
  text: '',
  todos: []
}

const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_TEXT:
      return {
        ...state,
        text: action.text
      }

    case ADD_TODO:
      return {
        ...state,
        text: '',
        todos: state.todos.concat({
          isEditing: false,
          isComplete: false,
          id: state.todos.length,
          text: action.text
        })
      }

    case TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(
          todo =>
            todo.id === action.id
              ? {
                  ...todo,
                  isComplete: !todo.isComplete
                }
              : todo
        )
      }

    case TOGGLE_EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(
          todo =>
            todo.id === action.id
              ? {
                  ...todo,
                  isEditing: !todo.isEditing
                }
              : todo
        )
      }

    case STOP_EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(
          todo =>
            todo.id === action.id
              ? {
                  ...todo,
                  isEditing: false
                }
              : todo
        )
      }

    case UPDATE_TODO:
      return {
        ...state,
        text: '',
        todos: state.todos.map(
          todo =>
            todo.id === action.id
              ? {
                  ...todo,
                  text: action.text
                }
              : todo
        )
      }

    case REMOVE_TODO:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id)
      }

    default:
      return state
  }
}

export default (state = initialState) => createStore(reducer, state)
