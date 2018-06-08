import { BehaviorSubject, sample } from '../utils/observables'
import { flatten, sharedRaf } from '../core'
import VPatch from './VPatch'

function createPropsStream(props) {
  const sub = new BehaviorSubject(props)
  return {
    next: props => sub.next(props),
    stream: sub
  }
}

export default class Component {
  constructor({ name, untouchedAttributes, key = '' }) {
    this.name = name
    this.untouchedAttributes = untouchedAttributes
    this.key = key
  }

  createElement(isSvg, patch, context) {
    let node = isSvg
      ? document.createElementNS('http://www.w3.org/2000/svg', 'g')
      : document.createElement('div')

    this.state = {}
    this.state.props = createPropsStream(this.untouchedAttributes)
    this.state.childTree = undefined

    const component = this.name(this.state.props.stream)

    if (!component)
      throw new Error(`Component ${this.name.name} must return a stream!`)

    const stream =
      typeof component === 'function' ? component(context) : component

    this.state.subscription = stream
      .pipe(flatten, sample(sharedRaf))
      .subscribe({
        next: newChildTree => {
          if (newChildTree instanceof VPatch) {
            this.state.childTree = newChildTree.vTree
          } else {
            node = patch(
              node,
              this.state.childTree,
              newChildTree,
              isSvg,
              context
            )
            this.state.childTree = newChildTree
          }
        },
        error: e => console.error(e)
      })

    return node
  }

  updateElement(node, previousComponent, isSvg, patch, context) {
    this.state = previousComponent.state

    if (previousComponent.name !== this.name) {
      previousComponent.removeElement(node)
      return this.createElement(isSvg, patch, context)
    } else {
      this.state.props.next(this.untouchedAttributes)
    }
  }

  removeElement(node) {
    this.state.subscription.unsubscribe()
    if (this.state.childTree) this.state.childTree.removeElement(node)
  }

  mount() {}
}
