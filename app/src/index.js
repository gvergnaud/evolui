import html, { render } from '../../package/src'
import App from './components/App'
import { Observable } from 'rxjs'

render(App(), document.querySelector('#root'))
