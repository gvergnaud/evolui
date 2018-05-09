import io from 'socket.io-client'
import { Observable } from 'rxjs'
import html from 'evolui'

const _socket = io('https://chat-server-dkkxygrves.now.sh')
const socket = {
  on: e =>
    new Observable(observer => {
      socket.on(e, message => observer.next(message))
    }),
  emit: (e, data) => _socket.emit(e, data)
}

const merge = (...obs) =>
  new Observable(observer => {
    const subs = obs.map(stream =>
      stream.subscribe({
        next: x => observer.next(x),
        complete: x => {},
        error: e => observer.error(e)
      })
    )
    return { unsubscribe: () => subs.forEach(sub => sub.unsubscribe()) }
  })

const createState = (initialState, handlers) => {
  const sources = mapValues(handler => {
    const sub = new Subject()
    return { intent: x => sub.next(x), stream: handler(sub) }
  }, handlers)

  return {
    intents: mapValues(s => s.intent, sources),
    state$: merge(...mapValues(s => s.stream, sources))
      .scan((state, f) => ({ ...state, ...f(state) }), initialState)
      .startWith(initialState)
  }
}

const Chat = props$ => {
  const username$ = props$.map(p => p.username)

  const initialState = {
    text: '',
    messages: []
  }

  const { state$, intents } = createState(initialState, {
    changeText: stream => stream.map(e => () => ({ text: e.target.value })),
    sendMessage: stream =>
      stream
        .filter(e => e.which === 13)
        .combineLatest(username$, (message, username) => ({
          message,
          username
        }))
        .tap(data => socket.emit('message', data))
        .map(() => () => ({})),
    addMessage: () =>
      socket.on('message').map(message => ({ messages }) => ({
        messages: messages.concat(message)
      }))
  })

  return html`
    <div>
      <h1>Hello, ${username$}</h1>
      <input
        onInput=${intents.changeText}
        onKeyDown=${intents.sendMessage} />

      <ul>
        ${state$.map(state =>
          state.messages.map(
            ({ username, message }) =>
              html`
                <li>
                  ${username}: ${message}
                </li>
              `
          )
        )}
      </ul>
    </div>
  `
}

export default Chat
