import html from 'evolui'
import { map } from 'rxjs/operators'

const InputBar = props$ =>
  props$.pipe(
    map(({ value, onChange, onSubmit }) => {
      const onKeyDown = e => {
        if (e.which === 13) onSubmit(value)
      }

      const onInput = e => onChange(e.target.value)

      return html`
        <input
          value=${value}
          onInput=${onInput}
          onKeyDown=${onKeyDown} />
      `
    })
  )

export default InputBar
