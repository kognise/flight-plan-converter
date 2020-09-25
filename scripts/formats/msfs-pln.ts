import { Format, Waypoint, WaypointType } from '../util/types'
import { d2pdms, pdms2d, invert } from '../util/helpers'
import { convert, create } from 'xmlbuilder2'

const typeKeyToTypes: Record<string, WaypointType> = {
	'Airport': WaypointType.Airport,
	'VOR': WaypointType.VOR,
	'NDB': WaypointType.NDB,
	'Intersection': WaypointType.Intersection,
	'User': WaypointType.Other // TODO: Double-check
}
const typeToTypeKeys = invert(typeKeyToTypes)

const getLla = (info: { latitude: number, longitude: number }) => {
	return `${d2pdms(info.latitude, true)},${d2pdms(info.longitude, false)},+0.00`
}

interface AtcWaypoint {
	'@id': string
	'ATCWaypointType': keyof typeof typeKeyToTypes
	'WorldPosition': string,
	'ICAO'?: { 'ICAOIdent': string }
}

const msfsPln: Format = {
	extensions: [ 'pln' ],
	title: 'FSX, P3D, and FS2020 .PLN',
	id: 'msfs-pln',

	// @ts-ignore
	parse: (raw) => {
		const obj = convert(raw, { format: 'object' }) as any
		const fplWaypoints = obj['SimBase.Document']['FlightPlan.FlightPlan']['ATCWaypoint'] as FplWaypoint[]

		const getWaypoint = (atcWaypoint: AtcWaypoint): Waypoint => ({
			name: atcWaypoint.ICAO?.ICAOIdent ?? atcWaypoint['@id'],
			type: typeKeyToTypes[atcWaypoint.ATCWaypointType],
			latitude: pdms2d(atcWaypoint.WorldPosition.split(',')[0]),
			longitude: pdms2d(atcWaypoint.WorldPosition.split(',')[1])
		})

		return {
			departure: getWaypoint(fplWaypoints[0]),
			arrival: getWaypoint(fplWaypoints[fplWaypoints.length - 1]),
			route: fplWaypoints
				.slice(1, -1)
				.filter((wp) => ![ 'TIMECRUIS', 'TIMEDSCNT' ].includes(wp['@id']))
				.map(getWaypoint)
		}
	},

	stringify: (plan) => {
		const wholeRoute = [ plan.departure, ...plan.route, plan.arrival ]

		const tree = {
			'SimBase.Document': {
				'@Type': 'AceXML',
				'@version': '1,0',
				'Descr': 'AceXML Document',
				'FlightPlan.FlightPlan': {
					'Title': `${plan.departure.name} to ${plan.arrival.name}`,
					'Descr': `${plan.departure.name} to ${plan.arrival.name}`,
					'FPType': 'VFR',
					'CruisingAlt': 200,

					'DepartureName': plan.departure.name,
					'DepartureID': plan.departure.name,
					'DepartureLLA': getLla(plan.departure),

					'DestinationName': plan.arrival.name,
					'DestinationID': plan.arrival.name,
					'DestinationLLA': getLla(plan.arrival),

					'AppVersion': {
						'AppVersionMajor': 10,
						'AppVersionBuild': 61472
					},

					'ATCWaypoint': wholeRoute.map((wp) => ({
						'@id': wp.name,
						'ATCWaypointType': typeToTypeKeys[wp.type],
						'WorldPosition': getLla(wp),
						...(wp.type === WaypointType.Other ? {} : {
							'ICAO': {
								'ICAOIdent': wp.name
							}
						})
					}))
				}
			} 
		}

		return create(tree).end({ prettyPrint: true })
	}
}

export default msfsPln