import html from 'evolui'

export default () => html`
    <div>
      ${async function*() {
        let i = 0
        while (true) {
          yield i++
        }
      }}
    </div>
`
