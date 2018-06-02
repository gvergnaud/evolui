import { h } from 'evolui'
import { map } from 'rxjs/operators'

const Select = props$ =>
  props$.pipe(
    map(({ options, onChange, value }) => (
      <select onChange={e => onChange(e.target.value)}>
        {options.map(option => (
          <option selected={option.value === value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    ))
  )

export default Select
