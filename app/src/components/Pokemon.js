import html from '../html'
import { Observable } from 'rxjs'

const fetchPokemon = id =>
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(x => x.json())
    .then(x => x.forms[0].name)

const Pokemon = () => html`
  <div>
    <p>Hello ${Observable.interval(10000)
      .map(x => x + 1)
      .flatMap(x => Observable.fromPromise(fetchPokemon(x)))}</p>
    <p>my favorite pokemon is ${fetchPokemon(10)}</p>
  </div>
`

export default Pokemon
