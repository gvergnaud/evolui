import { flatMap } from '../utils/arrays'
import { isEmpty, createDefaultLifecycle } from '../utils/misc'
import {
  isPromise,
  isObservable,
  map,
  filter,
  flip
} from '../utils/observables'

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
      : isEmpty(c)
        ? []
        : ['VNode', 'VText', 'VPatch', 'Component'].some(
            type => c.type === type
          )
          ? [c]
          : isObservable(c) || isPromise(c)
            ? [
                {
                  type: 'Component',
                  name: function AnonymousComponent() {
                    return flip(c).pipe(
                      map(child => formatChildren([child])),
                      map(
                        children =>
                          children.length === 1 ? children[0] : children
                      ),
                      filter(x => !isEmpty(x))
                    )
                  },
                  untouchedAttributes: { children: [] }
                }
              ]
            : [{ type: 'VText', text: c }]
)

export default function h(name, _attributes, ..._children) {
  const attributes = _attributes || {}
  const children = _children.reduce((acc, x) => acc.concat(x), [])

  if (typeof name === 'function') {
    return {
      type: 'Component',
      name,
      untouchedAttributes: { ...attributes, children }
    }
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

  return {
    type: 'VNode',
    name,
    attrs,
    lifecycle,
    events,
    children: formatChildren(children),
    key
  }
}
