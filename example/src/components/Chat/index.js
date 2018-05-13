import html from 'evolui'
import { all, createActions, createState } from 'evolui/extra'
import { filter, map, tap } from 'rxjs/operators'
import createSocket from './createSocket'

const Repeat = () => {
  const state = createState({ value: '' })
  return html`
    <div>
      <input
        value=${state.value}
        onInput=${e => state.value.set(e.target.value)} />
      <p>${state.value}</p>
    </div>
  `
}

const Chat = props$ => {
  const socket = createSocket()

  const actions = createActions({
    changeText: stream =>
      stream.pipe(map(e => (typeof e === 'string' ? e : e.target.value))),
    sendMessage: (stream, getState) =>
      stream.pipe(
        filter(e => e.which === 13),
        map(() => ({
          username: props$.value.username,
          message: getState().text
        })),
        tap(data => socket.emit('message', data)),
        tap(() => actions.changeText(''))
      ),
    addMessage: () => socket.on('message')
  })

  const initialState = {
    text: '',
    messages: []
  }

  const state$ = actions.foldState(initialState, {
    changeText: (state, text) => ({ text }),
    addMessage: (state, message) => ({
      messages: [...state.messages, message]
    })
  })

  return all([state$, props$]).pipe(
    map(
      ([state, props]) => html`
        <div>
          ${props.username ? html`<h1>Hello, ${props.username}</h1>` : ''}

          <input
            placeholder="message"
            value=${state.text}
            onInput=${actions.changeText}
            onKeyDown=${actions.sendMessage}
          />

          <ul>
            ${state.messages.map(
              ({ username, message }) => html`
                <li>${username}: ${message}</li>
              `
            )}
          </ul>

          <${Repeat} />
        </div>
      `
    )
  )
}
export default Chat
