import html from '../html'
import store from '../store'

import Ticker from './Ticker'
import InputBar from './InputBar'
import MouseTracker from './MouseTracker'
import TodoList from './TodoList'
import Pokemon from './Pokemon'

const App = () => html`
  <div>
    ${Pokemon()}
    ${Ticker()}
    ${InputBar()}
    ${MouseTracker()}
    ${store.state.switchMap(({ todos }) => TodoList({ todos }))}
  </div>
`

export default App
