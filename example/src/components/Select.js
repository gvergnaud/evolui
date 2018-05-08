import html from 'evolui'

const Select = props$ =>
  props$.map(
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

export default Select
