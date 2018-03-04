import html from '../../../lib/evolui'

const Select = ({ options, onChange, value$ }) => html`
  <select onchange="${e => onChange(e.target.value)}">
    ${options.map(({ title, value }) =>
      value$.map(v => html`
        <option
          ${value === v ? 'selected' : ''}
          value="${value}">${title}</option>
      `)
    )}
  </select>
`

export default Select
