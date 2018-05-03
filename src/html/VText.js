export default class VText {
  constructor({ text }) {
    this.text = text
  }

  createElement() {
    return document.createTextNode(this.text)
  }

  updateElement(node, previousText) {
    if (previousText.text !== this.text) node.textContent = this.text
  }

  removeElement() {}

  mount() {}
}
