import h from '../../src/html/h'
import patch, { createElement } from '../../src/html/patch'
import hyperx from 'hyperx'

const html = hyperx(h)

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

    patch(
      el,
      html`
        <div class="something" />
      `
    )

    expect(el).toEqual(
      getHtml(`
        <div class="something"></div>
      `)
    )

    patch(
      el,
      html`
        <div class="something" cool="yes" />
      `
    )

    expect(el).toEqual(
      getHtml(`
        <div class="something" cool="yes"></div>
      `)
    )

    patch(
      el,
      html`
        <div hello="good" />
      `
    )

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

    patch(
      el,
      html`
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
    )

    expect(unmountWasCalled).toBe(false)

    patch(
      el,
      html`
        <div>
        </div>
      `
    )

    expect(unmountWasCalled).toBe(true)
  })
})
