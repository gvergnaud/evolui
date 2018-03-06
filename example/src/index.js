import html, { render } from '../../src'
import {createState} from './utils'
import Select from './components/Select'

import Ticker from './components/Ticker'
import TodoList from './components/TodoList'
import MouseTracker from './components/MouseTracker'
import HttpRequest from './components/HttpRequest'
import Chat from './components/Chat'
import SimpleAnimation from './components/animations/SimpleAnimation'
import ComplexeAnimation from './components/animations/ComplexeAnimation'
import PinterestLikeGrid from './components/animations/PinterestLikeGrid'

const selectedExample = createState('TodoList')
const examples = [
  { title: 'TodoList', value: 'TodoList' },
  { title: 'SimpleAnimation', value: 'SimpleAnimation' },
  { title: 'ComplexeAnimation', value: 'ComplexeAnimation' },
  { title: 'PinterestLikeGrid', value: 'PinterestLikeGrid' },
  { title: 'Chat', value: 'Chat' },
  { title: 'MouseTracker', value: 'MouseTracker' },
  { title: 'HttpRequest', value: 'HttpRequest' },
  { title: 'Ticker', value: 'Ticker' },
]

render(
  html`
    <div>
      ${Select({
        value$: selectedExample.stream,
        onChange: selectedExample.set,
        options: examples
      })}

      ${selectedExample.stream.map(v =>
        v === 'TodoList' ? TodoList()
        : v === 'SimpleAnimation' ? SimpleAnimation()
        : v === 'ComplexeAnimation' ? ComplexeAnimation()
        : v === 'PinterestLikeGrid' ? PinterestLikeGrid()
        : v === 'Chat' ? Chat()
        : v === 'MouseTracker' ? MouseTracker()
        : v === 'HttpRequest' ? HttpRequest()
        : v === 'Ticker' ? Ticker()
        : null
      )}
    </div>
  `,
  document.querySelector('#root')
)
