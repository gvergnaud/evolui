import html, { render, createState } from 'evolui'
import { map } from 'rxjs/operators'

import Select from './components/Select'
import PinterestLikeGrid from './components/animations/PinterestLikeGrid'
import ComplexAnimation from './components/animations/ComplexAnimation'
import SimpleAnimation from './components/animations/SimpleAnimation'
import SvgAnimation from './components/animations/SvgAnimation'
import Spreadsheet from './components/Spreadsheet'
import Ticker from './components/Ticker'
import TodoList from './components/TodoList'
import Chat from './components/Chat'
import MouseTracker from './components/MouseTracker'
import HttpRequest from './components/HttpRequest'

import './index.css'

const examples = [
  { title: 'ComplexAnimation', value: 'ComplexAnimation' },
  { title: 'Spreadsheet', value: 'Spreadsheet' },
  { title: 'TodoList', value: 'TodoList' },
  { title: 'SimpleAnimation', value: 'SimpleAnimation' },
  { title: 'SvgAnimation', value: 'SvgAnimation' },
  { title: 'PinterestLikeGrid', value: 'PinterestLikeGrid' },
  { title: 'Chat', value: 'Chat' },
  { title: 'MouseTracker', value: 'MouseTracker' },
  { title: 'HttpRequest', value: 'HttpRequest' },
  { title: 'Ticker', value: 'Ticker' }
]

const components = {
  PinterestLikeGrid,
  ComplexAnimation,
  SimpleAnimation,
  SvgAnimation,
  Spreadsheet,
  Ticker,
  TodoList,
  Chat,
  MouseTracker,
  HttpRequest
}

const App = () => {
  const state = createState({ selectedExample: 'ComplexAnimation' })

  return html`
    <div>
      <h3>A few examples of what you can do with evolui 🚀</h3>

      <p>
        Choose an example 👉
        <${Select}
          value=${state.selectedExample}
          onChange=${state.selectedExample.set}
          options=${examples}
        />
      </p>

      ${state.selectedExample.pipe(
        map(name => components[name]),
        map(Component => html`<${Component} />`)
      )}
    </div>
  `
}

render(App(), document.querySelector('#root'))
