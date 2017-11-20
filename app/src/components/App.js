import {Observable} from 'rxjs'
import {html} from '../framework'
import {
  CreateElement,
  CreateTextNode,
  CloseElement
} from '../framework/Operation'

// const World = () => {
//   return html([
//     [
//       new CreateTextNode('World'),
//     ],
//   ]);
// };

export default () => {
  return html(
    [
      [new CreateElement('h1'), new CreateTextNode('Hello ')],
      [new CloseElement()]
    ],
    Observable.interval(1000).map(i => ['.', '..', '...', 'World!'][i])
  )
}
