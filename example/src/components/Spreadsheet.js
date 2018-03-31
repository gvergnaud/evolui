import html, { text } from 'evolui'
import { set, over, view } from 'immutable-deep-update'
import { Observable } from 'rxjs'
import { createState } from '../utils'

const range = (start, end) =>
  Array(end - start)
    .fill(0)
    .map((_, i) => i + start)
const flatMap = (f, xs) => xs.reduce((acc, x) => acc.concat(f(x)), [])
const flatten = xs => flatMap(x => x, xs)

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const rowCount = 15
const colCount = 8

const createKey = (i, j) => `${j}${i}`

const createCellState = (value = '') => ({ value, focus: false })

const initialCellsState = {
  A1: 'a',
  B1: 'b',
  C1: 'total',
  A2: '21',
  B2: 'f(A2)',
  C2: 'f(A2 + B2)',
  A4: 'random stuff:',
  B4: 'f(A2 / 7)',
  C4: 'f(B4 * B2)'
}

const formulaRegexp = /^f\((.+)\)$/
const cellRefRegexp = /([A-Z][0-9]+)/g

const titleCellStyle = {
  width: '30px',
  textAlign: 'center'
}

const Spreadsheet = () => {
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
    const variables = parsed
      .filter(str => cellRefRegexp.test(str))
      .map(key => getCellValue(key)) // eslint-disable-line

    return Observable.from(text(strings, ...variables)).map(expr => {
      try {
        return `${eval(expr)}` // unsafe but good enough for the example
      } catch (e) {
        return expr
      }
    })
  }

  const getCellState = key =>
    state.stream.map(s => s[key]).distinctUntilChanged()

  const getCellValue = key =>
    getCellState(key).switchMap(({ value, focus }) => {
      if (focus || !formulaRegexp.test(value)) return Observable.of(value)
      const [, formula] = value.match(formulaRegexp)
      return parseFormula(formula)
    })

  const getCellFocus = key => getCellState(key).map(({ focus }) => focus)

  const setCellFocus = (key, focus) => state.over(set(`${key}.focus`, focus))

  const setCellValue = (key, value) => state.over(set(`${key}.value`, value))

  return html`
    <table>
      <tr>
        <td></td>
        ${grid[0].map(([, j]) => html`<td style="${titleCellStyle}">${j}</td>`)}
      </tr>
      ${grid.map(
        row =>
          html`
            <tr>
              <td style="${titleCellStyle}">${row[0][0]}</td>
              ${row.map(([i, j]) => createKey(i, j)).map(
                key => html`
                  <td>
                    <input
                      ${getCellFocus(key).map(
                        focus => (focus ? 'autofocus' : '')
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
    <h2>Very basic spreadsheet example</h2>
    <p>
      You can create formulas with
      ${Code('`f(...)`')}, in which you can reference other cells.
    </p>
    <p>
      for example try typing
      ${Code('2')} in A1 and
      ${Code('3')} in B1, then type ${Code('f(A1 + B1)')} in another cell.
    </p>
    ${Spreadsheet()}
  </div>
`
