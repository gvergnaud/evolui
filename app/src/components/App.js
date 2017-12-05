// import { Observable } from 'rxjs'
import { html, Component } from '../framework'
import {
  OpenElement,
  ToggleClassName,
  CreateTextNode,
  CloseElement
} from '../framework'

class Title extends Component {
  render() {
    const { children = [] } = this.props
    return html`
        <h1 class="title">${children}</h1>
    `
  }
}

class Greetings extends Component {
  render() {
    const { name = 'Anonymous' } = this.props
    return html`Hello ${name}`
  }
}

export default class extends Component {
  render() {
    const { name } = this.props
    return new Title({
      children: [new Greetings({ name })]
    })
  }
}
