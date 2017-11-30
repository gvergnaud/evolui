import html from '../html'
import store from '../store'

import Ticker from './Ticker'
import InputBar from './InputBar'
import MouseTracker from './MouseTracker'
import TodoList from './TodoList'
import Pokemon from './Pokemon'
import Chat from './Chat'

const TodoApp = () => html`
  ${InputBar()}
  ${store.state.switchMap(({ todos }) => TodoList({ todos }))}
`
// ${Pokemon()}
// ${TodoApp()}
// ${Ticker()}
// ${MouseTracker()}

const App = () => html`
  <div>
    ${Chat()}
  </div>
`

export default App
