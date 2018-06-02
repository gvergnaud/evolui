import { h } from 'evolui'
import { map } from 'rxjs/operators'
import './index.css'

const getImageUrl = ({ thumbnails: { images } }) =>
  images.reduce(
    (bestImage, image) =>
      Math.abs(image.height - 500) < Math.abs(bestImage.height - 500)
        ? image
        : bestImage,
    { height: 10 }
  ).url

const ModelCard = props$ => {
  return (
    <a
      target="_blank"
      href={props$.pipe(map(p => p.model.viewerUrl))}
      class="card"
      style={{
        transform: props$.pipe(map(({ x, y }) => `translate(${x}px, ${y}px)`)),
        height: props$.pipe(map(({ height }) => `${height}px`)),
        width: props$.pipe(map(({ width }) => `${width}px`))
      }}
    >
      <div
        class="cardImage"
        style={{
          backgroundImage: props$.pipe(map(p => `url(${getImageUrl(p.model)})`))
        }}
      />
      <p class="name">{props$.pipe(map(p => p.model.name))}</p>
    </a>
  )
}

export default ModelCard
