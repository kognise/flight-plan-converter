import { extname } from 'path'
import { formats } from '../util/formats'
import { download } from '../util/helpers'
import { Format } from '../util/types'
import { state } from './state'

export const listeners = {
  init() {
    window.addEventListener('click', (event) => {
      const targetElement = event.target as Element
      if (targetElement.tagName !== 'BUTTON') return
    
      const id = targetElement.getAttribute('data-id')
      if (!id) return
    
      if (targetElement.parentElement?.id === 'from-format-list') {
        state.selectedFrom = id
      } else if (targetElement.parentElement?.id === 'to-format-list') {
        (async () => {
          if (!state.file) return

          try {
            const from = formats.find((format) => format.id === state.selectedFrom) as Format
            const to = formats.find((format) => format.id === id) as Format

            if (!from.extensions.includes(extname(state.file.name).toLowerCase().slice(1))) {
              throw new Error(`Invalid extension, supported: ${from.extensions.join(',')}`)
            }

            const parsed = from.parse(await state.file.text())
            download(
              `${parsed.departure.name} to ${parsed.arrival.name}.${to.extensions[0]}`,
              to.stringify(parsed)
            )
          } catch (error) {
            alert(`Couldn't convert your flight plan! ${error?.toString() ?? error ?? 'Unknown error'}`)
          }
        })()
      }
    })

    const pickFile = () => {
      document.getElementById('drop-zone-fake-input')!.click()
    }

    document.getElementById('drop-zone')!.addEventListener('click', () => {
      pickFile()
    })

    document.getElementById('drop-zone')!.addEventListener('keydown', (event) => {
      if ([ 'Enter', 'Space' ].includes(event.code)) {
        pickFile()
      }
    })
    
    document.getElementById('drop-zone')!.addEventListener('drop', async (event) => {
      event.preventDefault()
      state.file = event.dataTransfer?.items[0].getAsFile() ?? null
    })
    
    document.getElementById('drop-zone')!.addEventListener('dragover', (event) => {
      event.preventDefault()
    })
    
    document.getElementById('drop-zone-fake-input')!.addEventListener('input', (event) => {
      const { files } = (event.target as unknown as { files?: FileList })
      if (files && files[0]) state.file = files[0]
    })
  }
}