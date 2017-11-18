import html from '../html'
import { Observable } from 'rxjs'

const Ticker = () => html`
  <span>${Observable.interval(1000).startWith(0)}</span>
`

export default Ticker
