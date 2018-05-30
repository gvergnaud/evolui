import { BehaviorSubject } from '../utils/observables'
import { createElement, removeElement } from './lifecycle'

function createPropsStream(props) {
  const sub = new BehaviorSubject(props)
  return {
    next: props => sub.next(props),
    stream: sub
  }
}

export default class Component {
  constructor({ name, untouchedAttributes, key = '' }) {
    this.type = 'Component'
    this.name = name
    this.untouchedAttributes = untouchedAttributes
    this.key = key
  }

  createElement(isSvg) {
    let node = isSvg
      ? document.createElementNS('http://www.w3.org/2000/svg', 'g')
      : document.createElement('div')

    this.state = {}
    this.state.props = createPropsStream(this.untouchedAttributes)
    this.state.childTree = undefined

    const vdomStream = this.name(this.state.props.stream)

    if (!vdomStream)
      throw new Error(`Component ${this.name.name} must return a stream!`)

    this.state.subscription = render(vdomStream, node)

    return node
  }

  updateElement(node, previousComponent, isSvg, patch) {
    this.state = previousComponent.state

    if (previousComponent.name !== this.name) {
      removeElement(previousComponent, node)
      return createElement(this, isSvg, patch)
    } else {
      this.state.props.next(this.untouchedAttributes)
    }
  }

  removeElement(node) {
    this.state.subscription.unsubscribe()
    if (this.state.childTree) removeElement(this.state.childTree, node)
  }

  mount() {}
}
