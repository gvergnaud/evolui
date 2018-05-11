import html from 'evolui'
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
  const style$ = props$.pipe(
    map(
      ({ x, y, width, height }) => `
        transform: translate(${x}px, ${y}px);
        height: ${height}px;
        width: ${width}px;
      `
    )
  )

  return html`
    <a
      target="_blank"
      href="${props$.pipe(map(p => p.model.viewerUrl))}"
      class="card"
      style="${style$}">
      <div
        class="cardImage"
        style="background-image: url(${props$.pipe(
          map(p => getImageUrl(p.model))
        )});"></div>
      <p class="name">${props$.pipe(map(p => p.model.name))}</p>
    </a>
  `
}

export default ModelCard
