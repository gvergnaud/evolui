import html from 'evolui'
import { Observable } from 'rxjs'

const getCharacter = id =>
  fetch(`https://swapi.co/api/people/${id}`)
    .then(res => res.json())
    .then(character => character.name)

const HttpRequest = () => html`
  <div>
    ${[1, 2, 3].map(
      id => html`
      <h1>
        ${Observable.fromPromise(getCharacter(id)).startWith('Loading...')}
      </h1>
    `
    )}
  </div>
`

export default HttpRequest
