import {html} from '../framework'
import {Observable} from 'rxjs'

const Ticker = () => Observable
  .interval(1000)
  .startWith(0)
  .switchMap(n => html`<span>${n}</span>`)

export default Ticker
