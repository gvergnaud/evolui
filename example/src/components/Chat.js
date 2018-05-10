import html from 'evolui'
import io from 'socket.io-client'
import { Observable } from 'rxjs'
import { scan, startWith, map } from 'rxjs/operators'

const Chat = () => {
  const socket = io('https://chat-server-dkkxygrves.now.sh')

  const message$ = new Observable(observer => {
    socket.on('message', message => observer.next(message))
  })

  const sendMessage = message => socket.emit('message', message)

  const onKeyDown = ({ which, target }) => {
    if (which === 13) {
      sendMessage(target.value)
      target.value = ''
    }
  }

  return html`
    <div>
        <input onkeydown="${onKeyDown}" />
        ${message$.pipe(
          scan((acc, x) => [...acc, x], []),
          startWith([]),
          map(messages => messages.map(message => html`<p>${message}</p>`))
        )}
    </div>
  `
}

export default Chat
