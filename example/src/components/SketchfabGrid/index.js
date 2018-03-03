import {Observable, Subject} from 'rxjs'
import html, {toAStream} from '../../../../src'
import ease from '../../ease'
import classNames from './index.css'

const getModels = sortBy =>
  fetch(`https://sketchfab.com/i/models?count=10&liked_by=981035ddb1d54b628b8d16200aecff13&processing_status=succeeded&restricted=1&sort_by=-liked_at`)
    .then(res => res.json())
    .then(res => res.results)

const getCardHeight = ({ name }) => Math.max(300, Math.min(800, name.length * 20))

const getImageUrl = ({ thumbnails: { images } }) =>
  images.reduce(
    (bestImage, image) => Math.abs(image.height - 500) < Math.abs(bestImage.height - 500)
      ? image
      : bestImage,
    { height: 10 }
  ).url


const ModelCard = ({ model, x, y, width, height }) => html`
  <div
    class="${classNames.card}"
    style="
      transform: translate(${x}px, ${y}px);
      height: ${height}px;
      width: ${width}px;
    ">
    <div
      class="${classNames.cardImage}"
      style="background-image: url(${getImageUrl(model)});"></div>
    <p class="${classNames.name}">${model.name}</p>
  </div>
`

const mouse$ = Observable.fromEvent(window, 'mousemove')
  .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))

const windowDimension$ = Observable.fromEvent(window, 'resize')
  .map(() => ({ width: window.innerWidth, height: window.innerHeight }))
  .startWith({ width: window.innerWidth, height: window.innerHeight })
  .shareReplay(1)


const colCount$ =
  windowDimension$
    .map(({ width }) =>
      width < 680 ? 1
      : width < 1024 ? 2
      : 3
    )

const gutterSize = 10

export default () => {
  const sub = new Subject();

  const sort$ = sub
    .startWith('none')
    .shareReplay(1)

  return html`
    <div class="${classNames.grid}">
      <select onchange="${e => sub.next(e.target.value)}">
        <option value="none">none</option>
        <option value="viewCount">viewCount</option>
        <option value="createdAt">createdAt</option>
      </select>

      <button onclick="${() => sub.next('shuffle')}">
        Shuffle
      </button>

      <div class="${classNames.container}">
        ${
          sort$
            .combineLatest(
              Observable.fromPromise(getModels()),
              colCount$,
              (sort, models, colCount) => [
                models
                  .slice()
                  .sort((a, b) =>
                    sort === 'none' ? 0
                    : sort === 'viewCount' ? b.viewCount - a.viewCount
                    : sort === 'createdAt' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : sort === 'shuffle' ? Math.random() > .5 ? 1 : -1
                    : 0
                  ),
                colCount
              ]

            )
          .map(([models, colCount]) =>
              // [Model] -> [[{ width, height, x, y }, Model]]
              models.reduce((grid, model, index) => {
                const cardAbove = grid[index - colCount]

                const width$ =
                  windowDimension$
                    .map(({ width }) => width / colCount - (gutterSize * 2 + gutterSize * (colCount - 1)))

                const x$ =
                  width$.map(width => {
                    const col = (index % colCount)
                    return col * (width + gutterSize)
                  })

                const height = getCardHeight(model)
                const y = cardAbove ? cardAbove[0].y + cardAbove[0].height + gutterSize : 0

                const dimension = {
                  height,
                  y,
                  width$,
                  x$,
                  height$: Observable.of(height),
                  y$: Observable.of(y),
                }

                return grid.concat([[dimension, model]])
              }, [])
          )
          .map(models =>
            models.map(([dimension, model]) =>
               ModelCard({
                 model,
                 x: dimension.x$.switchMap(ease(170, 18, model.uid + 'x')),
                 y: dimension.y$.switchMap(ease(150, 28, model.uid + 'y')),
                 height: dimension.height$.switchMap(ease(170, 20, model.uid + 'height')),
                 width: dimension.width$.switchMap(ease(170, 20, model.uid + 'width'))
              })
            )
          )
        }
      </div>
    </div>
  `
}
