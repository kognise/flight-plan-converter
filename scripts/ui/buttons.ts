import { formats } from '../formats'

const getFormatButtons = () => formats.map((format) => `
  <button data-id='${format.id}'>
    ${format.title}
  </button>
`).join('\n')

export const buttons = {
  init() {
    document.getElementById('from-format-list')!.innerHTML = getFormatButtons()
    document.getElementById('to-format-list')!.innerHTML = getFormatButtons()
  }
}