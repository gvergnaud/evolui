import html from 'evolui'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

const Ticker = () => html`
  <span>
    ${interval(1000).pipe(map(x => x + 1), startWith(0))}
  </span>
`

export default Ticker
