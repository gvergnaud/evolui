import html from '../html'
import store from '../store'

import Ticker from './Ticker'
import InputBar from './InputBar'
import MouseTracker from './MouseTracker'
import TodoList from './TodoList'
import Pokemon from './Pokemon'
import Chat from './Chat'

const TodoApp = () => html`
  <div>
    ${InputBar()}
    ${store.state.switchMap(({ todos }) => TodoList({ todos }))}
  </div>
`

const App = () => html`
  <div>
    ${Pokemon()}
    ${TodoApp()}
    ${Ticker()}
    ${MouseTracker()}
  </div>
`

export default App
