import VNode from './VNode'
import VText from './VText'
import Component from './Component'

import { flatMap } from '../utils/arrays'
import { isEmpty, createDefaultLifecycle } from '../utils/misc'

const isLifecycle = key => ['mount', 'update', 'unmount'].includes(key)
const isEvent = key => !!key.match(/^on/)
const toEventName = key => key.replace(/^on/, '').toLowerCase()

const styleToObject = styleStr =>
  styleStr.split(';').reduce((acc, str) => {
    const [k, ...v] = str.split(/:/)
    if (k.trim()) acc[k.trim()] = v.join(':')
    return acc
  }, {})

const formatChildren = flatMap(
  c =>
    Array.isArray(c)
      ? formatChildren(c)
      : [VNode, VText, Component].some(C => c instanceof C)
        ? [c]
        : isEmpty(c)
          ? []
          : [new VText({ text: `${c}` })]
)

export default function h(name, attributes = {}, children = []) {
  if (typeof name === 'function') {
    return new Component({
      name,
      untouchedAttributes: { ...attributes, children }
    })
  }

  const { key, lifecycle, events, attrs } = Object.entries(attributes).reduce(
    (acc, [key, value]) => {
      if (key === 'key') {
        acc.key = value
      } else if (isLifecycle(key) && typeof value === 'function') {
        acc.lifecycle[key] = value
      } else if (isEvent(key) && typeof value === 'function') {
        acc.events[toEventName(key)] = value
      } else if (key === 'style') {
        acc.attrs[key] =
          typeof value === 'object' ? value : styleToObject(value)
      } else {
        acc.attrs[key] = value
      }
      return acc
    },
    { lifecycle: createDefaultLifecycle(), events: {}, attrs: {} }
  )

  return new VNode({
    name,
    attrs,
    lifecycle,
    events,
    children: formatChildren(children),
    key
  })
}
