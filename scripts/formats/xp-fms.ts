import { Format, FlightPlan, Waypoint, WaypointType } from '../util/types'
import { getAiracCycle, invert } from '../util/helpers'

const typeToNumbers: Record<WaypointType, number> = {
	[WaypointType.Airport]: 1,
	[WaypointType.NDB]: 2,
	[WaypointType.VOR]: 3,
	[WaypointType.Intersection]: 11,
	[WaypointType.Other]: 28,
}
const numberToTypes = invert(typeToNumbers)

const xpFms: Format = {
	extensions: [ 'fms' ],
	title: 'X-Plane .FMS',
	id: 'xp-fms',

	stringify: (plan) => {
		const lines: (string | (string | number)[])[] = []

		lines.push('I')
		lines.push('1100 Version')
		lines.push([ 'CYCLE', getAiracCycle() ])

		lines.push([
			plan.departure.type === WaypointType.Airport ? 'ADEP' : 'DEP',
			plan.departure.name
		])
		lines.push([
			plan.arrival.type === WaypointType.Airport ? 'ADES' : 'DES',
			plan.arrival.name
		])

		lines.push([ 'NUMENR', plan.route.length + 2 ])

		lines.push([
			typeToNumbers[plan.departure.type],
			plan.departure.name,
			plan.departure.type === WaypointType.Airport ? 'ADEP' : 'DRCT',
			0,
			plan.departure.latitude,
			plan.departure.longitude
		])

		for (const waypoint of plan.route) {
			lines.push([
				typeToNumbers[waypoint.type],
				waypoint.name,
				'DRCT',
				0,
				waypoint.latitude,
				waypoint.longitude
			])
		}

		lines.push([
			typeToNumbers[plan.arrival.type],
			plan.arrival.name,
			plan.arrival.type === WaypointType.Airport ? 'ADES' : 'DRCT',
			0,
			plan.arrival.latitude,
			plan.arrival.longitude
		])

		return lines.map((line) => typeof line === 'string'
			? line : line.map((item) => item.toString()).join(' '))
			.join('\n')
	},

	parse: (raw) => {
		const lines = raw
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => !!line)
			.map((line) => line.split(' '))

		const version = parseInt(lines[1][0])

		const lineToWaypoint = (line: string[]): Waypoint => ({
			name: line[1],
			type: numberToTypes[parseInt(line[0])],
			latitude: parseFloat(line[version === 1100 ? 4 : 3]),
			longitude: parseFloat(line[version === 1100 ? 5 : 4])
		})
		
		const beforeRouteIndex = lines.findIndex((line) => line[0] === 'NUMENR')
		const routePoints = parseInt(lines[beforeRouteIndex][1])

		return {
			departure: lineToWaypoint(lines[beforeRouteIndex + 1]),
			arrival: lineToWaypoint(lines[beforeRouteIndex + routePoints]),
			route: lines
				.slice(beforeRouteIndex + 2, beforeRouteIndex + routePoints)
				.map(lineToWaypoint)
		}
	}
}

export default xpFms