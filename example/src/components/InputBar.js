import html from 'evolui'
import store from '../store'

const InputBar = () => {
  const onKeyDown = e => {
    if (e.which === 13) store.actions.addTodo(e.target.value)
  }

  const onInput = e =>
    store.actions.updateText(e.target.value)

  return html`
    <input
      value="${store.state$.map(({ text }) => text)}"
      oninput=${onInput}
      onkeydown=${onKeyDown} />
  `
}

export default InputBar
