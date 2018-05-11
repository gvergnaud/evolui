import html, { render, createState } from 'evolui'
import Select from './components/Select'

import Ticker from './components/Ticker'
import TodoList from './components/TodoList'
import MouseTracker from './components/MouseTracker'
import HttpRequest from './components/HttpRequest'
import Chat from './components/Chat'
import Spreadsheet from './components/Spreadsheet'
import SimpleAnimation from './components/animations/SimpleAnimation'
import ComplexAnimation from './components/animations/ComplexAnimation'
import SvgAnimation from './components/animations/SvgAnimation'
import PinterestLikeGrid from './components/animations/PinterestLikeGrid'

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
  Spreadsheet,
  TodoList,
  SimpleAnimation,
  ComplexAnimation,
  SvgAnimation,
  PinterestLikeGrid,
  Chat,
  MouseTracker,
  HttpRequest,
  Ticker
}

const App = () => {
  const state = createState({ selectedExample: 'ComplexAnimation' })

  const component$ = state.selectedExample.map(name => components[name])

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

      ${component$.map(Component => html`<${Component} />`)}
    </div>
  `
}

render(App(), document.querySelector('#root'))
