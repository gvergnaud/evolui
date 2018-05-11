import html, { ease, createState, all } from 'evolui'
import { of, fromEvent } from 'rxjs'
import { map, startWith, shareReplay, switchMap } from 'rxjs/operators'

import Select from './../../Select'
import ModelCard from './ModelCard'

const Grid = props$ => {
  const windowDimension$ = fromEvent(window, 'resize').pipe(
    map(() => ({ width: window.innerWidth, height: window.innerHeight })),
    startWith({ width: window.innerWidth, height: window.innerHeight }),
    shareReplay(1)
  )

  const colCount$ = windowDimension$.pipe(
    map(
      ({ width }) => (width < 480 ? 1 : width < 960 ? 2 : width < 1280 ? 3 : 4)
    )
  )

  const gutterSize = 10

  return props$.pipe(
    map(({ models }) => {
      const state = createState({ sort: 'none' })

      const sortOptions = [
        { title: 'none', value: 'none' },
        { title: 'viewCount', value: 'viewCount' },
        { title: 'createdAt', value: 'createdAt' },
        { title: 'shuffle', value: 'shuffle' }
      ]

      const modelsAndDimensions$ = all([state.sort, colCount$]).pipe(
        map(([sort, colCount]) => {
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

            const width$ = windowDimension$.pipe(
              map(
                ({ width }) =>
                  width / colCount -
                  (gutterSize * 2 + gutterSize * (colCount - 1))
              )
            )

            const x$ = width$.pipe(
              map(width => {
                const col = index % colCount
                return col * (width + gutterSize)
              })
            )

            const y = cardAbove
              ? cardAbove[0].y + cardAbove[0].height + gutterSize
              : 0

            const dimension = {
              height,
              y,
              width$,
              x$,
              height$: of(height),
              y$: of(y)
            }

            return grid.concat([[dimension, model]])
          }, [])
        })
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
            ${modelsAndDimensions$.pipe(
              map(modelsAndDimensions =>
                modelsAndDimensions.map(
                  ([dimension, model]) =>
                    html`
                      <${ModelCard}
                        model=${model}
                        x=${dimension.x$.pipe(
                          switchMap(ease(150, 18, model.uid + 'x'))
                        )}
                        y=${dimension.y$.pipe(
                          switchMap(ease(120, 25, model.uid + 'y'))
                        )}
                        height=${dimension.height$.pipe(
                          switchMap(ease(170, 20, model.uid + 'height'))
                        )}
                        width=${dimension.width$.pipe(
                          switchMap(ease(170, 20, model.uid + 'width'))
                        )}
                      />
                    `
                )
              )
            )}
        </div>
      </div>
      `
    })
  )
}

export default Grid
