import html, { render } from 'evolui'
import { createState } from './utils'
import Select from './components/Select'

import Ticker from './components/Ticker'
import TodoList from './components/TodoList'
import MouseTracker from './components/MouseTracker'
import HttpRequest from './components/HttpRequest'
import Chat from './components/Chat'
import Spreadsheet from './components/Spreadsheet'
import SimpleAnimation from './components/animations/SimpleAnimation'
import ComplexeAnimation from './components/animations/ComplexeAnimation'
import SvgAnimation from './components/animations/SvgAnimation'
import PinterestLikeGrid from './components/animations/PinterestLikeGrid'

import './index.css'

const examples = [
  { title: 'ComplexeAnimation', value: 'ComplexeAnimation' },
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
  ComplexeAnimation,
  SvgAnimation,
  PinterestLikeGrid,
  Chat,
  MouseTracker,
  HttpRequest,
  Ticker
}

const App = () => {
  const selectedExample = createState('ComplexeAnimation')
  return html`
    <div>
      <h3>A few examples of what you can do with evolui 🚀</h3>

      <p>Choose an example 👉 ${Select({
        value$: selectedExample.stream,
        onChange: selectedExample.set,
        options: examples
      })}</p>

      ${selectedExample.stream.map(name => components[name]())}
    </div>
  `
}

render(App(), document.querySelector('#root'))
