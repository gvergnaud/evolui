import html, { render } from '../src'

describe('evolui', () => {
  it('svg components should work', done => {
    const Path = () => html`<path />`

    render(
      html`
          <svg>
              <${Path} />
          </svg>
      `,
      document.body
    )

    setTimeout(() => {
      expect(document.body.innerHTML).toEqual('<svg><path></path></svg>')
      done()
    }, 50)
  })
})
