import createTag from 'vdom-tag'
import { Observable } from '../utils/observables'
import { createReactiveTag } from '../core'
import patch from './patch'
import h from './h'
import VNode from './VNode'
import VPatch from './VPatch'

const createRenderProcess = vdom$ =>
  new Observable(observer => {
    let domNode
    let previousTree
    let isSvg

    return vdom$.subscribe({
      complete: () => observer.complete(),
      error: e => observer.error(e),
      next: vTree => {
        if (!(vTree instanceof VNode)) return observer.next(vTree)

        const onMount = vTree.lifecycle.mount

        vTree.lifecycle.mount = (node, _isSvg) => {
          domNode = node
          isSvg = _isSvg
          onMount(node)
        }

        if (!domNode) {
          observer.next(vTree)
        } else {
          domNode = patch(domNode, previousTree, vTree, isSvg)
          observer.next(new VPatch(vTree))
        }

        previousTree = vTree
      }
    })
  })

const toRenderProcess = tag => (strings, ...variables) =>
  createRenderProcess(tag(strings, ...variables))

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = toRenderProcess(createReactiveTag(createTag(h)))

export default html
