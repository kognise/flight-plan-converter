import 'focus-visible'

const a = document.getElementById('a')! as HTMLTextAreaElement
const b = document.getElementById('b')! as HTMLPreElement

import msfsPln from './formats/msfs-pln'
import xpFms from './formats/xp-fms'

a.addEventListener('input', () => {
  localStorage.setItem('testing-a', a.value)
  b.innerText = xpFms.stringify(msfsPln.parse(a.value))
})

a.value = localStorage.getItem('testing-a') ?? ''
b.innerText = xpFms.stringify(msfsPln.parse(a.value))