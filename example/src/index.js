import html, { render, h, VNode, VText, VPatch, Component } from 'evolui'
import { createState, flip } from 'evolui/extra'
import { fromEvent } from 'rxjs'
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

const log = (x, label = '') => (console.log(label, x), x)

const constructs = {
  VNode,
  VText,
  VPatch,
  Component
}

const iString = x => typeof x === 'string'

const applyH = h => args => {
  return !args
    ? null
    : iString(args)
      ? args
      : h(
          args[0],
          args[1],
          iString(args[2]) ? [args[2]] : !args[2] ? [] : args[2].map(applyH(h))
        )
}

const mouseX = fromEvent(window, 'mousemove').pipe(
  map(e => e.clientX / window.innerWidth)
)

const hh = (a, b, c) => [a, b, c]

const WeirdComponent = state =>
  flip([
    'div',
    {},
    [
      [
        'div',
        {
          style: {
            backgroundColor: mouseX.pipe(
              map(opacity => `rgba(50, 154, 29, ${opacity})`)
            )
          }
        },
        [['div', {}, ['test']]]
      ],
      ['p', {}, ['Coucou']],
      [
        'p',
        {},
        [state.selectedExample, state.selectedExample, state.selectedExample]
      ]
    ]
  ]).pipe(map(applyH(h)))

// const WeirdComponent = state =>
//   flip(
//     <div>
//       <div
//         style={{
//           backgroundColor: mouseX.pipe(
//             map(opacity => `rgba(50, 154, 29, ${opacity})`)
//           )
//         }}
//       >
//         <div>test</div>
//       </div>
//       <p>
//         {state.selectedExample}
//         {state.selectedExample}
//         {state.selectedExample}
//       </p>
//     </div>
//   ).pipe(map(log), map(applyH(h)))

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

      ${WeirdComponent(state)}

      ${state.selectedExample.pipe(
        map(name => components[name]),
        map(Component => html`<${Component} />`)
      )}
    </div>
  `
}

render(App(), document.querySelector('#root'))
