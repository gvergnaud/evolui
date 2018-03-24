import html, { render } from 'evolui'
import { createState } from './utils'
import Select from './components/Select'

import Ticker from './components/Ticker'
import TodoList from './components/TodoList'
import MouseTracker from './components/MouseTracker'
import HttpRequest from './components/HttpRequest'
import Chat from './components/Chat'
import SimpleAnimation from './components/animations/SimpleAnimation'
import ComplexeAnimation from './components/animations/ComplexeAnimation'
import SvgAnimation from './components/animations/SvgAnimation'
import PinterestLikeGrid from './components/animations/PinterestLikeGrid'

const examples = [
  { title: 'TodoList', value: 'TodoList' },
  { title: 'SimpleAnimation', value: 'SimpleAnimation' },
  { title: 'ComplexeAnimation', value: 'ComplexeAnimation' },
  { title: 'SvgAnimation', value: 'SvgAnimation' },
  { title: 'PinterestLikeGrid', value: 'PinterestLikeGrid' },
  { title: 'Chat', value: 'Chat' },
  { title: 'MouseTracker', value: 'MouseTracker' },
  { title: 'HttpRequest', value: 'HttpRequest' },
  { title: 'Ticker', value: 'Ticker' }
]

const components = {
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
  const selectedExample = createState('TodoList')
  return html`
    <div>
      ${Select({
        value$: selectedExample.stream,
        onChange: selectedExample.set,
        options: examples
      })}

      ${selectedExample.stream.map(name => components[name]())}
    </div>
  `
}

render(App(), document.querySelector('#root'))
