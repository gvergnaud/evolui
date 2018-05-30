import { mount, updateElement, createElement, removeElement } from './lifecycle'

export default class VPatch {
  constructor({ vTree }) {
    this.type = 'VPatch'
    this.vTree = vTree
  }

  createElement(...args) {
    return createElement(this.vTree, ...args)
  }

  updateElement(...args) {
    return updateElement(this.vTree, ...args)
  }

  removeElement(...args) {
    return removeElement(this.vTree, ...args)
  }

  mount(...args) {
    return mount(this.vTree, ...args)
  }
}
