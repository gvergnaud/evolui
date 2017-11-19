// import { Observable } from 'rxjs';
import { html, Component } from '../framework';
import { OpenElement, ToggleClassName, CreateTextNode, CloseElement } from '../framework';

class Title extends Component {
  render() {
    const { children = [] } = this.props;
    return html([
      [
        new OpenElement('h1'),
        new ToggleClassName('title', true),
      ],
      [
        new CloseElement(),
      ],
    ], children);
  }
}

class Greetings extends Component {
  render() {
    const { name = 'Anonymous' } = this.props;
    return html([
      [
        new CreateTextNode('Hello '),
      ],
    ], name);
  }
}

export default class extends Component {
  render() {
    const { name } = this.props;
    return new Title({
      children: [
        new Greetings({ name }),
      ],
    });
  }
}
