import html, { text, createState } from 'evolui'
import { set } from 'immutable-deep-update'
import { from, of } from 'rxjs'
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators'
import initialCellsState from './initialCellsState'

import './index.css'

const Spreadsheet = () => {
  const range = (start, end) =>
    Array(end - start)
      .fill(0)
      .map((_, i) => i + start)
  const flatMap = (f, xs) => xs.reduce((acc, x) => acc.concat(f(x)), [])
  const flatten = xs => flatMap(x => x, xs)
  const addQuotes = str => `"${str.replace('"', '\\"')}"`

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const rowCount = 15
  const colCount = 8

  const createKey = (i, j) => `${j}${i}`

  const createCellState = (value = '') => ({ value, focus: false })

  const formulaRegexp = /^\{(.+)\}$/
  const cellRefRegexp = /([A-Z][0-9]+)/g
  const isNumber = x => !isNaN(parseFloat(x)) && !x.match(/([a-z]|\s)/i)
  const isValidExpression = x => isNumber(x) || formulaRegexp.test(x)

  const grid = range(0, rowCount).map(i =>
    range(0, colCount).map(j => [i + 1, alphabet[j]])
  )

  const state = createState(
    flatten(grid).reduce((rowState, [i, j]) => {
      const key = createKey(i, j)
      return {
        ...rowState,
        [key]: createCellState(initialCellsState[key])
      }
    }, {})
  )

  // parseFormula :: String -> Observable String
  const parseFormula = formula => {
    const parsed = formula.split(cellRefRegexp)
    const strings = parsed.filter(str => !cellRefRegexp.test(str))
    const variables = parsed.filter(str => cellRefRegexp.test(str)).map(key =>
      // eslint-disable-next-line
      getCellValue(key).pipe(
        map(value => (isValidExpression(value) ? value : addQuotes(value)))
      )
    )

    return from(text(strings, ...variables)).pipe(
      map(expr => {
        try {
          return `${eval(expr)}` // unsafe but good enough for the example
        } catch (e) {
          return expr
        }
      })
    )
  }

  const getCellState = key => from(state[key]).pipe(distinctUntilChanged())

  const getCellValue = key =>
    getCellState(key).pipe(
      switchMap(({ value, focus }) => {
        if (focus || !formulaRegexp.test(value)) return of(value)
        const [, formula] = value.match(formulaRegexp)
        return parseFormula(formula)
      })
    )

  const getCellFocus = key => getCellState(key).pipe(map(({ focus }) => focus))

  const setCellFocus = (key, focus) => state[key].set(set('focus', focus))

  const setCellValue = (key, value) => state[key].set(set('value', value))

  return html`
    <table class="Spreadsheet">
      <tr>
        <td></td>
        ${grid[0].map(
          ([, j]) => html`<td class="Spreadsheet-titleCell">${j}</td>`
        )}
      </tr>
      ${grid.map(
        row =>
          html`
            <tr>
              <td class="Spreadsheet-titleCell">${row[0][0]}</td>
              ${row.map(([i, j]) => createKey(i, j)).map(
                key => html`
                  <td>
                    <input
                      ${getCellFocus(key).pipe(
                        map(focus => (focus ? 'autofocus' : ''))
                      )}
                      value="${getCellValue(key)}"
                      onFocus="${() => setCellFocus(key, true)}"
                      onBlur="${() => setCellFocus(key, false)}"
                      onInput="${e => setCellValue(key, e.target.value)}"
                    />
                  </td>
                `
              )}
            </tr>
          `
      )}
    </table>
  `
}

const Code = str => html`
  <code style=${{ fontWeight: 'bold' }}>${str}</code>
`

export default () => html`
  <div>
    <h2>Very basic spreadsheet</h2>
    <p>Create formulas with the curly brackets ${Code('`{...}`')}.</p>
    <p>Manipulate other cells with <strong>javascript</strong>.</p>
    <p>Example: try typing ${Code('{A2 + B2}')} in a cell</p>
    <p>
    <${Spreadsheet} />
  </div>
`
