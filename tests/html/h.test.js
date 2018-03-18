import h, { VNode, VText } from '../../src/html/h'
import hyperx from 'hyperx'

const html = hyperx(h)

describe('h', () => {
  it('should work when only giving a node name', () => {
    expect(h('div')).toEqual(
      new VNode({
        name: 'div',
        attrs: {},
        lifecycle: {},
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
        attrs: { className: 'User' },
        children: [
          new VNode({
            attrs: { className: 'User-image', src: '/path/to/img.jpg' },
            children: [],
            events: {},
            lifecycle: {},
            name: 'img'
          }),
          new VNode({
            attrs: { className: 'User-name' },
            children: [new VText({ text: 'Toto' })],
            events: {},
            lifecycle: {},
            name: 'h1'
          })
        ],
        events: {},
        lifecycle: {},
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
        attrs: { className: 'User' },
        children: [],
        events: {
          click: onClick,
          keydown: onKeyDown
        },
        lifecycle: {},
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
        attrs: { className: 'User' },
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
