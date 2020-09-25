class State {
  private _selectedFrom: string | null = null
  private _file: File | null = null

  get selectedFrom() { return this._selectedFrom }
  get file() { return this._file }

  set selectedFrom(value) {
    this._selectedFrom = value
    this._file = null
    this.updated()
    this.store()
  }
  set file(value) {
    this._file = value
    this.updated()
  }

  private updated() {
    document.getElementById('from-format-list')!.childNodes.forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return
      const el = child as Element
      el.classList.toggle('active', this._selectedFrom === el.getAttribute('data-id'))
    })

    document.getElementById('drop-zone')!.innerText = this._file
      ? `Selected: ${this._file.name}, pick an output format below`
      : 'Drop your flight plan here or click to upload'
    document.getElementById('drop-zone')!.classList.toggle('active', !!this._selectedFrom)

    document.getElementById('to-format-container')!.classList.toggle('active', !!this._file)
  }

  private store() {
    if (this._selectedFrom) {
      localStorage.setItem('selected-from', this._selectedFrom)
    } else {
      localStorage.deleteItem('selected-from')
    }
  }

  init() {
    this._selectedFrom = localStorage.getItem('selected-from')
    this.updated()
  }
}

export const state = new State()