import VNode from './VNode'
import VText from './VText'
import Component from './Component'

const classes = {
  VNode,
  VText,
  Component
}

export const createElement = (vTree, ...args) =>
  classes[vTree.type].prototype.createElement.apply(vTree, args)

export const mount = (vTree, ...args) =>
  classes[vTree.type].prototype.mount.apply(vTree, args)

export const updateElement = (vTree, ...args) =>
  classes[vTree.type].prototype.updateElement.apply(vTree, args)

export const removeElement = (vTree, ...args) =>
  classes[vTree.type].prototype.removeElement.apply(vTree, args)
