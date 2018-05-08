import h from '../../src/html/h'
import VNode from '../../src/html/VNode'
import VText from '../../src/html/VText'
import createTag from 'vdom-tag'
import { createDefaultLifecycle } from '../../src/utils/misc'

const html = createTag(h)

describe('h', () => {
  it('should work when only giving a node name', () => {
    expect(h('div')).toEqual(
      new VNode({
        name: 'div',
        attrs: {},
        lifecycle: createDefaultLifecycle(),
        events: {},
        children: []
      })
    )
  })

  it('should work with nested elements', () => {
    expect(
      html`
        <div class="User">
          <img class="User-image" src="/path/to/img.jpg" />
          <h1 class="User-name">Toto</h1>
        </div>
      `
    ).toEqual(
      new VNode({
        attrs: { class: 'User' },
        children: [
          new VNode({
            attrs: { class: 'User-image', src: '/path/to/img.jpg' },
            children: [],
            events: {},
            lifecycle: createDefaultLifecycle(),
            name: 'img'
          }),
          new VNode({
            attrs: { class: 'User-name' },
            children: [new VText({ text: 'Toto' })],
            events: {},
            lifecycle: createDefaultLifecycle(),
            name: 'h1'
          })
        ],
        events: {},
        lifecycle: createDefaultLifecycle(),
        name: 'div'
      })
    )
  })

  it('should recognize events', () => {
    const onClick = () => console.log('onClick')
    const onKeyDown = () => console.log('onKeyDown')

    expect(
      html`
        <div class="User" onClick="${onClick}" onKeyDown=${onKeyDown} />
      `
    ).toEqual(
      new VNode({
        attrs: { class: 'User' },
        children: [],
        events: {
          click: onClick,
          keydown: onKeyDown
        },
        lifecycle: createDefaultLifecycle(),
        name: 'div'
      })
    )
  })

  it('should recognize lifecycle', () => {
    const mount = () => console.log('mount')
    const update = () => console.log('update')
    const unmount = () => console.log('unmount')

    expect(
      html`
        <div
          class="User"
          mount=${mount}
          update=${update}
          unmount=${unmount}
        />
      `
    ).toEqual(
      new VNode({
        attrs: { class: 'User' },
        children: [],
        events: {},
        lifecycle: {
          mount,
          update,
          unmount
        },
        name: 'div'
      })
    )
  })
})
