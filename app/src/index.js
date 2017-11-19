import { render } from './framework'
import App from './components/App'

render(new App({ name: 'Sunshine' }),
  document.querySelector('main'));
