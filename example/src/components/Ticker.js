import html from 'evolui'
import { Observable } from 'rxjs'

const Ticker = () => html`
  <span>
    ${Observable.interval(1000)
      .map(x => x + 1)
      .startWith(0)}
  </span>
`

export default Ticker
