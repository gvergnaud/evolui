import store from '../store'
import {html} from '../framework'

import Ticker from './Ticker'
import InputBar from './InputBar'
import MouseTracker from './MouseTracker'
import TodoList from './TodoList'

const App = () => html`
  <div>
    ${Ticker()}
    ${InputBar()}
    ${MouseTracker()}
    ${store.state.switchMap(({ todos }) => TodoList({ todos }))}
  </div>
`

export default App
