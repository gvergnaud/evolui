import evolui, { render } from '../../package/lib/evolui'
import io from 'socket.io-client'
import { Observable } from 'rxjs'

const html = evolui(Observable)

const socket = io('https://chat-server-dkkxygrves.now.sh')

const messageStream = new Observable(observer => {
  socket.on('message', message => observer.next(message))
})

const onKeyDown = ({ which, target }) => {
  if (which === 13) {
    socket.emit('message', target.value)
    target.value = ''
  }
}

const Chat = () => html`
  <div>
    <input onkeydown=${onKeyDown} />
    <div>
      ${messageStream
        .scan((acc, x) => [...acc, x], [])
        .map(messages => messages.map(message => html`<p>${message}</p>`))}
    </div>
  </div>
`

render(Chat(), document.querySelector('#root'))
