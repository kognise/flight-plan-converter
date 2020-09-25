export enum WaypointType {
	Airport = 'AIRPORT',
	NDB = 'NDB',
	VOR = 'VOR',
	Intersection = 'FIX',
	Other = 'LAT_LON'
}

export interface Waypoint {
	name: string
	type: WaypointType
	latitude: number
	longitude: number
}

export interface FlightPlan {
	departure: Waypoint
	arrival: Waypoint
	route: Waypoint[]
}

export interface Format {
	extensions: string[]
	title: string
	id: string
	parse: (raw: string) => FlightPlan
	stringify: (plan: FlightPlan) => string
}