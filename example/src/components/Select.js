import html from 'evolui'
import { map } from 'rxjs/operators'

const Select = props$ =>
  props$.pipe(
    map(
      ({ options, onChange, value }) => html`
        <select onchange="${e => onChange(e.target.value)}">
          ${options.map(
            option => html`
              <option
                ${option.value === value ? 'selected' : ''}
                value="${option.value}">${option.title}</option>
            `
          )}
        </select>
      `
    )
  )

export default Select
