import { Subject, sample } from '../utils/observables'
import { flatten, sharedRaf } from '../core'
import VPatch from './VPatch'

function createPropsStream(props) {
  const sub = new Subject()
  return {
    next: props => sub.next(props),
    stream: sub.startWith(props).shareReplay(1)
  }
}

export default class Component {
  constructor({ name, untouchedAttributes, key = '' }) {
    this.name = name
    this.untouchedAttributes = untouchedAttributes
    this.key = key
  }

  createElement(isSvg, patch) {
    let node = isSvg
      ? document.createElementNS('g')
      : document.createElement('div')

    this.state = {}
    this.state.props = createPropsStream(this.untouchedAttributes)
    this.state.childTree = undefined

    const vdomStream = this.name(this.state.props.stream)

    if (!vdomStream)
      throw new Error(`Component ${this.name.name} must return a stream!`)

    this.state.subscription = vdomStream
      .pipe(flatten, sample(sharedRaf))
      .subscribe({
        next: newChildTree => {
          if (newChildTree instanceof VPatch) {
            this.state.childTree = newChildTree.vTree
          } else {
            node = patch(node, this.state.childTree, newChildTree, isSvg)
            this.state.childTree = newChildTree
          }
        },
        error: e => console.error(e)
      })

    return node
  }

  updateElement(node, previousComponent, isSvg, patch) {
    this.state = previousComponent.state

    if (previousComponent.name !== this.name) {
      previousComponent.removeElement(node)
      return this.createElement(isSvg, patch)
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
