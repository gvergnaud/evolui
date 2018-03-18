import { flatMap, isEmpty } from '../utils'

export class VNode {
  constructor({ name, attrs, lifecycle, events, children }) {
    this.name = name
    this.attrs = attrs
    this.lifecycle = lifecycle
    this.events = events
    this.children = children
  }
}

export class VText {
  constructor({ text }) {
    this.text = text
  }
}

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
      ? c
      : c instanceof VNode || c instanceof VText
        ? [c]
        : isEmpty(c) ? [] : [new VText({ text: `${c}` })]
)

export default function h(name, attributes = {}, children = []) {
  const { lifecycle, events, attrs } = Object.entries(attributes).reduce(
    (acc, [key, value]) => {
      if (isLifecycle(key) && typeof value === 'function') {
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
    { lifecycle: {}, events: {}, attrs: {} }
  )

  return new VNode({
    name,
    attrs,
    lifecycle,
    events,
    children: formatChildren(children)
  })
}
