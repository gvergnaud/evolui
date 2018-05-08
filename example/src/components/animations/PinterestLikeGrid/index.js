import { Observable } from 'rxjs'
import html, { ease, createState, all } from 'evolui'
import { createFetcher } from '../../../utils'

import Select from './../../Select'
import './index.css'
import { getLikes } from './Api'
import ModelCard from './ModelCard'

const windowDimension$ = Observable.fromEvent(window, 'resize')
  .map(() => ({ width: window.innerWidth, height: window.innerHeight }))
  .startWith({ width: window.innerWidth, height: window.innerHeight })
  .shareReplay(1)

const colCount$ = windowDimension$.map(
  ({ width }) => (width < 480 ? 1 : width < 960 ? 2 : width < 1280 ? 3 : 4)
)

const gutterSize = 10

const Grid = props$ =>
  props$.map(({ models }) => {
    const state = createState({ sort: 'none' })

    const sortOptions = [
      { title: 'none', value: 'none' },
      { title: 'viewCount', value: 'viewCount' },
      { title: 'createdAt', value: 'createdAt' },
      { title: 'shuffle', value: 'shuffle' }
    ]

    const modelsAndDimensions$ = all([state.sort, colCount$]).map(
      ([sort, colCount]) => {
        const sortedModels = models
          .slice()
          .sort(
            (a, b) =>
              sort === 'none'
                ? 0
                : sort === 'viewCount'
                  ? b.viewCount - a.viewCount
                  : sort === 'createdAt'
                    ? new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    : sort === 'shuffle' ? (Math.random() > 0.5 ? 1 : -1) : 0
          )

        // [Model] -> [[{ width, height, x, y }, Model]]
        return sortedModels.reduce((grid, model, index) => {
          const cardAbove = grid[index - colCount]

          const height = Math.max(300, Math.min(800, model.name.length * 30))

          const width$ = windowDimension$.map(
            ({ width }) =>
              width / colCount - (gutterSize * 2 + gutterSize * (colCount - 1))
          )

          const x$ = width$.map(width => {
            const col = index % colCount
            return col * (width + gutterSize)
          })

          const y = cardAbove
            ? cardAbove[0].y + cardAbove[0].height + gutterSize
            : 0

          const dimension = {
            height,
            y,
            width$,
            x$,
            height$: Observable.of(height),
            y$: Observable.of(y)
          }

          return grid.concat([[dimension, model]])
        }, [])
      }
    )

    return html`
    <div class="grid">
      <${Select}
        value=${state.sort}
        onChange=${state.sort.set}
        options=${sortOptions}
      />

      <button onclick="${() => state.sort.set('shuffle')}">
        Shuffle
      </button>

      <div class="container">
        ${modelsAndDimensions$.map(modelsAndDimensions =>
          modelsAndDimensions.map(
            ([dimension, model]) =>
              html`
                <${ModelCard}
                  model=${model}
                  x=${dimension.x$.switchMap(ease(150, 18, model.uid + 'x'))}
                  y=${dimension.y$.switchMap(ease(120, 25, model.uid + 'y'))}
                  height=${dimension.height$.switchMap(
                    ease(170, 20, model.uid + 'height')
                  )}
                  width=${dimension.width$.switchMap(
                    ease(170, 20, model.uid + 'width')
                  )}
                />
              `
          )
        )}
      </div>
    </div>
  `
  })

const likesFetcher = createFetcher(getLikes)

const SketchfabGrid = () => {
  const users = [
    { name: 'Gabriel', id: '981035ddb1d54b628b8d16200aecff13' },
    { name: 'Paul', id: 'f7b66ea8241c4ffa81cb7cee1c073894' }
  ]

  const state = createState({ userId: users[0].id })

  const models$ = state.userId
    .switchMap(userId => Observable.fromPromise(likesFetcher(userId)))
    .startWith([])

  return html`
    <div>
      <${Select}
        value=${state.userId}
        onChange=${state.userId.set}
        options=${users.map(({ name, id }) => ({ title: name, value: id }))}
      />

    <${Grid} models=${models$} />
    </div>
  `
}

export default SketchfabGrid
