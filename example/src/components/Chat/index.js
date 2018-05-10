import html from 'evolui'
import { all, createActions } from 'evolui/extra'
import { filter, map, tap } from 'rxjs/operators'
import createSocket from './createSocket'

const Chat = props$ => {
  const socket = createSocket()

  const actions = createActions({
    changeText: stream => stream,
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
            onInput=${e => actions.changeText(e.target.value)}
            onKeyDown=${actions.sendMessage}
          />

          <ul>
            ${state.messages.map(
              ({ username, message }) => html`
                <li>${username}: ${message}</li>
              `
            )}
          </ul>
        </div>
      `
    )
  )
}
export default Chat
