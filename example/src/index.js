import { render, h } from 'evolui'
import { ease } from 'evolui/extra'
import { map } from 'rxjs/operators'
import { mouse$ } from './context'

import './index.css'

const App = () => (
  <img
    src="https://media.giphy.com/media/5PSPV1ucLX31u/giphy.gif"
    style={{
      position: 'absolute',
      transformOrigin: '50%',
      fontSize: mouse$.pipe(
        map(m => m.y),
        ease(130, 20),
        map(y => y + 'px')
      ),
      transform: mouse$.pipe(
        ease({
          x: [160, 18],
          y: [120, 20]
        }),
        map(
          ({ x, y }) => `
          translate(calc(${x}px - 50%), calc(${y}px - 50%))
          rotateZ(${x}deg)
          `
        )
      )
    }}
  />
)

render(<App />, document.querySelector('#root'))
