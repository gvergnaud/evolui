import { render, h } from 'evolui'
import { ease, all, createState } from 'evolui/extra'
import { map, startWith } from 'rxjs/operators'
import { createDragHandler } from './utils'

import './index.css'

const DraggableImage = props$ => {
  const { onDragStart, drag$, isDragging$ } = createDragHandler()
  const state = createState({ isSelected: false })

  return (
    <img
      onClick={() => state.isSelected.set(x => !x)}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      draggable="false"
      src={props$.pipe(map(p => p.src))}
      style={{
        userSelect: 'none',
        position: 'absolute',
        transformOrigin: '50%',
        left: 0,
        top: 0,
        height: '200px',
        transform: all([drag$, isDragging$, state.isSelected]).pipe(
          startWith([
            {
              x: window.innerWidth * (0.15 + Math.random() * 0.7),
              y: window.innerHeight * (0.15 + Math.random() * 0.7),
              top: 0,
              left: 0
            },
            false,
            false
          ]),
          map(([{ x, y, top, left }, isDragging, isSelected]) => ({
            x: isSelected ? window.innerWidth / 2 : x + left,
            y: isSelected ? 355 : y + top,
            rotateZ:
              isDragging && !isSelected
                ? x + left
                : Math.round((x + left) / 360) * 360,
            scale: isSelected ? window.innerWidth / 355 : 1
          })),
          ease({
            scale: [160, 18],
            rotateZ: [160, 18],
            x: [160, 18],
            y: [120, 20]
          }),
          map(
            ({ x, y, rotateZ, scale }) => `
              translate(calc(${x}px - 50%), calc(${y}px - 50%))
              rotateZ(${rotateZ}deg)
              scale(${scale})
            `
          )
        )
      }}
    />
  )
}

const SKFB_API = 'https://sketchfab.com/i'
const qs = params =>
  `?${Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')}`

export const getLikes = userId =>
  fetch(
    `${SKFB_API}/models${qs({
      count: 12,
      liked_by: userId,
      processing_status: 'succeeded',
      restricted: 1,
      sort_by: '-liked_at'
    })}`
  )
    .then(res => res.json())
    .then(res => res.results)

const getImageUrl = ({ thumbnails: { images } }) =>
  images.reduce(
    (bestImage, image) =>
      Math.abs(image.height - 500) < Math.abs(bestImage.height - 500)
        ? image
        : bestImage,
    { height: 10 }
  ).url

render(
  <div>
    {getLikes('981035ddb1d54b628b8d16200aecff13').then(likes =>
      likes.map(model => <DraggableImage src={getImageUrl(model)} />)
    )}
  </div>,
  document.querySelector('#root')
)
