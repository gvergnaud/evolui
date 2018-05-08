import io from 'socket.io-client'
import { Observable } from 'rxjs'
import html from 'evolui'

const socket = io('https://chat-server-dkkxygrves.now.sh')

const message$ = new Observable(observer => {
  socket.on('message', message => observer.next(message))
})

const Chat = props$ => {
  const actions = createActions({
    changeText: stream => stream.map(e => e.target.value),
    sendMessage: stream =>
      all([
        props$.map(p => p.username),
        stream.filter(e => e.which === 13)
      ]).map(([username, message]) =>
        socket.emit('message', { username, message })
      )
  })

  const initialState = {
    text: '',
    messages: [],
    activeUsers: []
  }

  const state = createState(initialState, [
    actions.changeText$.map(text => state => ({ text })),
    actions.sendMessage$.map(() => () => ({ text: '' })),
    message$.map(message => state => ({
      messages: states.messages.concat(message)
    }))
  ])

  return html`
    <div>
        <input
          onInput=${actions.changeText}
          onKeyDown=${actions.sendMessage} />
        ${message$
          .scan((acc, x) => [...acc, x], [])
          .startWith([])
          .map(messages => messages.map(message => html`<p>${message}</p>`))}
    </div>
  `
}

export default Chat
