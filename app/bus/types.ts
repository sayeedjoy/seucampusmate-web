export interface BusStop {
    id: number;
    name: string;
    lat: number;
    lng: number;
}

export interface BusRoute {
    id: number;
    name: string;
    color: string;
    stops: BusStop[];
}
