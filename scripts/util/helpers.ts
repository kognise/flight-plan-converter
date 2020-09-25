export const getAiracCycle = () => {
	const daysPerCycle = 28
	const base = new Date(Date.UTC(1901, 0, 10))
	const millisPerDay = 24 * 60 * 60 * 1000
	const millisPerCycle = daysPerCycle * millisPerDay

	const totalCycles = Math.floor((Date.now() - base.getTime()) / millisPerCycle)

	const effectiveStartMillis = base.getTime() + (totalCycles * millisPerCycle)
	const effectiveStart = new Date(effectiveStartMillis)

	const yearStart = new Date(Date.UTC(effectiveStart.getFullYear(), 0, 1))
	const yearMillis = effectiveStartMillis - yearStart.getTime()
	const cycle = Math.floor(yearMillis / millisPerCycle) + 1

	const yearPart = (effectiveStart.getFullYear() % 100).toString().padStart(2, '0')
	const cyclePart = cycle.toString().padStart(2, '0')

	return yearPart + cyclePart
}

type AllowedKeys = string | number | symbol
export const invert = <A extends AllowedKeys, B extends AllowedKeys>(input: Record<A, B>): Record<B, A> => {
	const output = {} as Record<B, A>

	for (const key of Object.keys(input)) {
		// @ts-ignore
		output[input[key]] = key
	}

	return output
}

export const d2pdms = (degrees: number, lat: boolean) => {
	const ad = Math.abs(degrees)

	const p = lat
		? (degrees < 0 ? 'S' : 'N')
		: (degrees < 0 ? 'W' : 'E')
	const d = Math.floor(ad)
	const m = (ad - d) * 60
	const s = (m - Math.floor(m)) * 60

	return `${p}${d}° ${Math.floor(m)}' ${s.toFixed(2)}"`
}

export const pdms2d = (pdms: string) => {
	const split = pdms.split(' ')

	const p = pdms[0]
	const d = parseInt(split[0].slice(1, -1))
	const m = parseInt(split[1].slice(0, -1))
	const s = parseFloat(split[2].slice(0, -1))

	const sign = [ 'S', 'W' ].includes(p) ? -1 : 1
	const degrees = d + (m / 60) + (s / 3600)

	return sign * degrees
}

export const download = (fileName: string, text: string, generateLink = true) => {
  const el = document.createElement('a')

  el.href = generateLink ? `data:text/plain;charset=utf-8,${encodeURIComponent(text)}` : text
  el.download = fileName
  el.style.display = 'none'

  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)
}