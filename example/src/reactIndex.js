import { Observable } from 'rxjs'
import { createHtml } from '../../src'
import React from 'react'
import { render } from 'react-dom'

const html = createHtml(React.createElement)

const wrap = evoluiComponent =>
  class Wrap extends React.Component {
    constructor(props) {
      super(props)
      this.state = { element: <div /> }
    }

    componentDidMount() {
      evoluiComponent(this.props).forEach(element => this.setState({ element }))
    }

    render() {
      return this.state.element
    }
  }

const App = () => html`
  <div>
    Hello ${Observable.interval(1000)}
  </div>
`

const ReactApp = wrap(App)

render(<ReactApp />, document.querySelector('#root'))
