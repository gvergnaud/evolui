import html from 'evolui'
import './index.css'

const getImageUrl = ({ thumbnails: { images } }) =>
  images.reduce(
    (bestImage, image) =>
      Math.abs(image.height - 500) < Math.abs(bestImage.height - 500)
        ? image
        : bestImage,
    { height: 10 }
  ).url

const ModelCard = ({ model, x, y, width, height }) => html`
  <a
    key="${model.uid}"
    target="_blank"
    href="${model.viewerUrl}"
    class="card"
    style="
      transform: translate(${x}px, ${y}px);
      height: ${height}px;
      width: ${width}px;
    ">
    <div
      class="cardImage"
      style="background-image: url(${getImageUrl(model)});"></div>
    <p class="name">${model.name}</p>
  </a>
`

export default ModelCard
