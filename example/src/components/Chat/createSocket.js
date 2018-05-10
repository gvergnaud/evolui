import io from 'socket.io-client'
import { Observable } from 'rxjs'

export default function createSocket() {
  const _socket = io('https://chat-server-dkkxygrves.now.sh')
  return {
    on: e =>
      new Observable(observer => {
        const handler = message => observer.next(message)
        _socket.on(e, handler)
        return { unsubscribe: () => _socket.off(e, handler) }
      }),
    emit: (e, data) => _socket.emit(e, data)
  }
}
