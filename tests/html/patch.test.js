import h from '../../src/html/h'
import patch from '../../src/html/patch'
import createTag from 'vdom-tag'

const html = createTag(h)
const createElement = vTree => vTree.createElement(false, patch)

const getHtml = str => {
  const el = document.createElement('div')
  el.innerHTML = str.trim()
  return el.firstChild
}

describe('h', () => {
  it('createElement should successfully create a dom element', () => {
    expect(
      createElement(
        html`
          <div class="User">
            <img class="User-image" src="/path/to/img.jpg" />
            <h1 class="User-name">Toto</h1>
          </div>
        `
      )
    ).toEqual(
      getHtml(`
        <div class="User"><img class="User-image" src="/path/to/img.jpg" /><h1 class="User-name">Toto</h1></div>
      `)
    )
  })

  it('patch should transform the attributes', () => {
    const el = createElement(html`
      <div class="User" />
    `)

    expect(el).toEqual(
      getHtml(`
        <div class="User"></div>
      `)
    )

    let vTree
    let newVTree = html`
      <div class="something" />
    `

    patch(el, vTree, newVTree)

    expect(el).toEqual(
      getHtml(`
        <div class="something"></div>
      `)
    )

    vTree = newVTree
    newVTree = html`
      <div class="something" cool="yes" />
    `

    patch(el, vTree, newVTree)

    expect(el).toEqual(
      getHtml(`
        <div class="something" cool="yes"></div>
      `)
    )

    vTree = newVTree
    newVTree = html`
      <div hello="good" />
    `

    patch(el, vTree, newVTree)

    expect(el).toEqual(
      getHtml(`
        <div hello="good"></div>
      `)
    )
  })

  it('patch should trigger mount lifecycle', () => {
    let mountWasCalled = false
    const el = document.createElement('div')

    patch(
      el,
      undefined,
      html`
        <div>
          <div
            class="User"
            mount="${el => {
              expect(el).toEqual(
                getHtml(`
                  <div class="User"></div>
                `)
              )
              mountWasCalled = true
            }}" />
        </div>
      `
    )

    expect(mountWasCalled).toBe(true)
  })

  it('patch should trigger update lifecycle', () => {
    let updateWasCalled = false
    const el = document.createElement('div')

    patch(
      el,
      undefined,
      html`
        <div>
          <div
            class="User"
            update="${() => {
              updateWasCalled = true
            }}" />
        </div>
      `
    )

    expect(updateWasCalled).toBe(false)

    patch(
      el,
      undefined,
      html`
        <div>
          <div
            class="User"
            lol="yes"
            update="${el => {
              expect(el).toEqual(
                getHtml(`
                  <div class="User" lol="yes"></div>
                `)
              )
              updateWasCalled = true
            }}" />
        </div>
      `
    )

    expect(updateWasCalled).toBe(true)
  })

  it('patch should trigger unmount lifecycle', () => {
    let unmountWasCalled = false
    const el = document.createElement('div')

    let vTree
    let newVTree = html`
      <div>
        <div
          class="User"
          unmount="${el => {
            expect(el).toEqual(
              getHtml(`
                <div class="User"></div>
              `)
            )
            unmountWasCalled = true
          }}" />
      </div>
    `

    patch(el, vTree, newVTree)

    expect(unmountWasCalled).toBe(false)

    vTree = newVTree
    newVTree = html`
      <div>
      </div>
    `

    patch(el, vTree, newVTree)

    expect(unmountWasCalled).toBe(true)
  })
})
