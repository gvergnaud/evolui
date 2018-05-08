import io from 'socket.io-client'
import { Observable } from 'rxjs'
import html from 'evolui'

const socket = io('https://chat-server-dkkxygrves.now.sh')

const message$ = new Observable(observer => {
  socket.on('message', message => observer.next(message))
})

const Chat = component(
  {
    changeText: stream => stream.map(e => e.target.value),
    sendMessage: stream =>
      all([
        props$.map(p => p.username),
        stream.filter(e => e.which === 13)
      ]).tap(([username, message]) =>
        socket.emit('message', { username, message })
      )
  },
  actions =>
    createState(
      {
        text: '',
        messages: [],
        activeUsers: []
      },
      [
        actions.changeText$.map(text => state => ({ text })),
        actions.sendMessage$.map(() => () => ({ text: '' })),
        message$.map(message => state => ({
          messages: states.messages.concat(message)
        }))
      ]
    ),
  (props, state, actions) => {
    return html`
      <div>
          <h1>Hello, ${props.username}</h1>
          <input
            onInput=${actions.changeText}
            onKeyDown=${actions.sendMessage} />

          <ul>
            ${state.messages.map(
              ({ username, message }) => html`
                <li>
                  ${username}: ${message}
                </li>
              `
            )}
          </ul>
      </div>
    `
  }
)

export default Chat
