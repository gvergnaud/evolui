import html, { render } from 'evolui'
import { createState, flip } from 'evolui/extra'
import { fromEvent, Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

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

const mouseX = fromEvent(window, 'mousemove').pipe(
  map(e => e.clientX / window.innerWidth)
)

const log = (x, label = 'log') => (console.log(label, x), x)
const h = (name, attrs, ...children) => ({
  name,
  attrs: attrs || {},
  children
})

const WeirdComponent = state =>
  h('div', {}, [
    h('div', {}, [
      h(
        'div',
        {
          style: {
            backgroundColor: mouseX.pipe(
              map(opacity => `rgba(50, 154, 29, ${opacity})`)
            )
          }
        },
        [h('div', {}, ['test']), h('p', {}, ['Hello'])]
      ),
      h('p', {}, ['Coucou']),
      h('p', {}, [
        state.selectedExample,
        state.selectedExample,
        state.selectedExample
      ])
    ])
  ])

const WeirdComponentJSX = state => (
  <div>
    <div
      style={{
        backgroundColor: mouseX.pipe(
          map(opacity => `rgba(50, 154, 29, ${opacity})`)
        )
      }}
    >
      <div>test</div>
      <p>Hello</p>
    </div>
    <p>
      {' '}
      attends, quoi ??
      {state.selectedExample} +
      {state.selectedExample} +
      {state.selectedExample}
    </p>
  </div>
)

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

const state = createState({ selectedExample: 'ComplexAnimation' })

render(WeirdComponentJSX(state), document.querySelector('#root'))
