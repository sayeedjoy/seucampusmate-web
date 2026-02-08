"use client";

import { useState } from "react";
import { ChevronDown, Bus } from "lucide-react";
import {
    Map,
    MapControls,
    MapRoute,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
} from "@/components/ui/map";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { busRoutes } from "./data";
import type { BusRoute } from "./types";

const BusRouteMap = () => {
    const [selectedRoute, setSelectedRoute] = useState<BusRoute>(busRoutes[0]);

    const routeCoordinates: [number, number][] = selectedRoute.stops.map(
        (stop) => [stop.lng, stop.lat]
    );

    // Calculate center of the route
    const centerLat =
        selectedRoute.stops.reduce((sum, stop) => sum + stop.lat, 0) /
        selectedRoute.stops.length;
    const centerLng =
        selectedRoute.stops.reduce((sum, stop) => sum + stop.lng, 0) /
        selectedRoute.stops.length;

    const handleRouteSelect = (route: BusRoute) => {
        setSelectedRoute(route);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Route Selector Dropdown */}
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg",
                            "bg-white border border-neutral-200 shadow-sm",
                            "text-sm font-medium text-neutral-900",
                            "hover:bg-neutral-50 transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        )}
                        aria-label="Select bus route"
                    >
                        <Bus className="w-4 h-4 text-neutral-500" />
                        <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: selectedRoute.color }}
                        />
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                            {selectedRoute.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[280px] sm:w-[320px] bg-white border-neutral-200 shadow-lg">
                        {busRoutes.map((route) => (
                            <DropdownMenuItem
                                key={route.id}
                                onClick={() => handleRouteSelect(route)}
                                className={cn(
                                    "flex items-center gap-2 cursor-pointer",
                                    selectedRoute.id === route.id && "bg-neutral-100"
                                )}
                            >
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: route.color }}
                                />
                                <span className="truncate">{route.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-sm text-neutral-500">
                    {selectedRoute.stops.length} stops
                </span>
            </div>

            {/* Map Container */}
            <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <Map key={selectedRoute.id} center={[centerLng, centerLat]} zoom={12}>
                    <MapControls position="bottom-right" showZoom showLocate />

                    {/* Route Line */}
                    <MapRoute
                        coordinates={routeCoordinates}
                        color={selectedRoute.color}
                        width={4}
                        opacity={0.9}
                    />

                    {/* Bus Stop Markers */}
                    {selectedRoute.stops.map((stop) => (
                        <MapMarker
                            key={stop.id}
                            longitude={stop.lng}
                            latitude={stop.lat}
                        >
                            <MarkerContent>
                                <div
                                    className={cn(
                                        "flex items-center justify-center",
                                        "w-7 h-7 rounded-full",
                                        "bg-white border-2 shadow-md",
                                        "text-xs font-bold"
                                    )}
                                    style={{ borderColor: selectedRoute.color, color: selectedRoute.color }}
                                >
                                    {stop.id}
                                </div>
                            </MarkerContent>
                            <MarkerTooltip className="bg-white">
                                <span className="text-sm font-medium text-neutral-900">{stop.name}</span>
                            </MarkerTooltip>
                            <MarkerPopup closeButton>
                                <div className="p-2 min-w-[180px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                                            style={{ backgroundColor: selectedRoute.color }}
                                        >
                                            {stop.id}
                                        </span>
                                        <span className="text-sm font-semibold text-neutral-900">
                                            Stop {stop.id}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-700">{stop.name}</p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                    </p>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    ))}
                </Map>
            </div>

            {/* Stops List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedRoute.stops.map((stop) => (
                    <div
                        key={stop.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                    >
                        <span
                            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shrink-0"
                            style={{ backgroundColor: selectedRoute.color }}
                        >
                            {stop.id}
                        </span>
                        <span className="text-sm text-neutral-800 font-medium">
                            {stop.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusRouteMap;
