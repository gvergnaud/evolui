import { raf, share, sample, flip, map } from '../utils/observables'
import h from './h'
import patch from './patch'
import { createElement } from './lifecycle'

const sharedRaf = share()(raf)

const iString = x => typeof x === 'string'

const applyH = h => args => {
  return !args
    ? null
    : iString(args)
      ? args
      : h(
          args.name,
          args.attrs || {},
          iString(args.children)
            ? [args.children]
            : !args.children
              ? []
              : args.children.map(applyH(h))
        )
}

const toStream = component =>
  flip(component).pipe(map(applyH(h)), sample(sharedRaf))

// render :: Observable VirtualDOM -> DOMElement -> Promise Error ()
const render = (component, element) => {
  let rootNode = element.firstChild
  let previousTree

  return toStream(component).subscribe({
    next: vTree => {
      if (vTree.type === 'VPatch') {
        previousTree = vTree.vTree
      } else {
        if (!rootNode) {
          rootNode = createElement(vTree, false, patch)
          element.appendChild(rootNode)
        } else {
          rootNode = patch(rootNode, previousTree, vTree)
        }
        previousTree = vTree
      }
    }
  })
}

export default render
