import html, { render } from 'evolui'
import { createState } from 'evolui/extra'

import Chat from './components/Chat'

import './index.css'

const ChatWrapper = () => {
  const state = createState({ username: '' })

  return html`
        <div>
          <input
            placeholder="username"
            value=${state.username}
            onInput=${e => state.username.set(e.target.value)}
          />
          <${Chat} username=${state.username} />
        </div>
      `
}

render(html`<${ChatWrapper} />`, document.querySelector('#root'))
