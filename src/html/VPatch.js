export default class VPatch {
  constructor(vTree) {
    this.type = 'VPatch'
    this.vTree = vTree
  }

  createElement(...args) {
    return this.vTree.createElement(...args)
  }

  updateElement(...args) {
    return this.vTree.updateElement(...args)
  }

  removeElement(...args) {
    return this.vTree.removeElement(...args)
  }

  mount(...args) {
    return this.vTree.mount(...args)
  }
}
