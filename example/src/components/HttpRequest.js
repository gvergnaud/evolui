import html from 'evolui'
import { from } from 'rxjs'
import { startWith } from 'rxjs/operators'

const getCharacter = id =>
  fetch(`https://swapi.co/api/people/${id}`)
    .then(res => res.json())
    .then(character => character.name)

const HttpRequest = () => html`
  <div>
    ${[1, 2, 3].map(
      id => html`
        <h1>
          ${from(getCharacter(id)).pipe(startWith('Loading...'))}
        </h1>
      `
    )}
  </div>
`

export default HttpRequest
