import { Format, FlightPlan, Waypoint, WaypointType } from '../util/types'
import { invert } from '../util/helpers'
import { create, convert } from 'xmlbuilder2'

interface FplWaypoint {
	identifier: string
	type: string
	lat: number
	lon: number
}

interface FplRoutePoint {
	'waypoint-identifier': string
}

const typeKeyToTypes: Record<string, WaypointType> = {
	'AIRPORT': WaypointType.Airport,
	'VOR': WaypointType.VOR,
	'NDB': WaypointType.NDB,
	'INT': WaypointType.Intersection,
	'USER WAYPOINT': WaypointType.Other
}
const typeToTypeKeys = invert(typeKeyToTypes)

const garminFpl: Format = {
	extensions: [ 'fpl' ],
	title: 'Garmin .FPL',
	id: 'garmin-fpl',

	parse: (raw) => {
		const obj = convert(raw, { format: 'object' }) as any
		const fplWaypoints = obj['flight-plan']['waypoint-table']['waypoint'] as FplWaypoint[]
		const fplRoute = obj['flight-plan']['route']['route-point'] as FplRoutePoint[]

		const getWaypoint = (fplRoutePoint: FplRoutePoint): Waypoint => {
			const fplWaypoint = fplWaypoints.find((wp) => wp.identifier === fplRoutePoint['waypoint-identifier']) as FplWaypoint
			return {
				name: fplWaypoint.identifier,
				type: typeKeyToTypes[fplWaypoint.type],
				latitude: fplWaypoint.lat,
				longitude: fplWaypoint.lon
			}
		}

		return {
			departure: getWaypoint(fplRoute[0]),
			arrival: getWaypoint(fplRoute[fplRoute.length - 1]),
			route: fplRoute.slice(1, -1).map(getWaypoint)
		}
	},

	stringify: (plan) => {
		const wholeRoute = [ plan.departure, ...plan.route, plan.arrival ]

		const tree = {
			'flight-plan': {
				'@xmlns': 'http://www8.garmin.com/xmlschemas/FlightPlan/v1',
				'created': new Date().toISOString(),
				'waypoint-table': {
					'waypoint': wholeRoute.map((wp) => ({
						'identifier': wp.name,
						'type': typeToTypeKeys[wp.type],
						'country-code': {},
						'lat': wp.latitude,
						'lon': wp.longitude,
						'comment': {}
					}))
				},
				'route': {
					'route-name': `${plan.departure.name} ${plan.arrival.name}`,
					'flight-plan-index': 1,
					'route-point': wholeRoute.map((wp) => ({
						'waypoint-identifier': wp.name,
						'waypoint-type': typeToTypeKeys[wp.type],
						'waypoint-country-code': {}
					}))
				}
			}
		}

		return create(tree).end({ prettyPrint: true })
	}
}

export default garminFpl