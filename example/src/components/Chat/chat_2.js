import io from 'socket.io-client'
import { Observable } from 'rxjs'
import html from 'evolui'

const createActions = actions =>
  mapValues(mapper => {
    const sub = new Subject()
    const action = x => sub.next(x)
    action.stream = mapper(sub)
    return action
  })

const createState = (initialState, actions, mappers) => {
  return
}

const _socket = io('https://chat-server-dkkxygrves.now.sh')
const socket = {
  on: e =>
    new Observable(observer => {
      socket.on(e, message => observer.next(message))
    }),
  emit: (e, data) => _socket.emit(e, data)
}

const Chat = props$ => {
  const username$ = props$.map(p => p.username)

  // actions sont des function a -> () avec une clé { stream :: Observable a }
  const actions = createActions({
    changeText: stream => stream.map(e => e.target.value),
    sendMessage: stream =>
      all([username$, stream.filter(e => e.which === 13)]).tap(
        ([username, message]) => socket.emit('message', { username, message })
      ),
    addMessage: () => socket.on('message')
  })

  const initialState = {
    text: '',
    messages: []
  }

  const state$ = createState(initialState, actions, {
    changeText: text => state => ({ text }),
    sendMessage: () => () => ({ text: '' }),
    addMessage: message => ({ messages }) => ({
      messages: messages.concat(message)
    })
  })

  return state$.map(
    state => html`
      <div>
          <h1>Hello, ${username$}</h1>
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
  )
}
export default Chat
