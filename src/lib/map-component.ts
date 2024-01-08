import type { SeriesId } from "$db/types";
import { Map, Popup } from "maplibre-gl";
import type { Point } from "geojson";

type Marker = {
	lat: number | null;
	lon: number | null;
	title: string;
	series: SeriesId[];
};

class MapLibre extends HTMLElement {
	constructor() {
		super();

		const latlng: [number, number] = [
			Number(this.dataset.latitude),
			Number(this.dataset.longitude)
		];

		const map = new Map({
			container: "map",
			style: this.dataset.tiles ?? "",
			// attributionControl: false,
			center: latlng ?? [0, 0],
			zoom: Number(this.dataset.zoom)
		});

		const loadImage = async (url: string, name: string) =>
			new Promise((resolve, reject) => {
				map.loadImage(url, (error, image) => {
					if (error) reject(error);
					if (image) map.addImage(name, image);
				});
			});
		const loadAllImages = async (series: string[]) => {
			const seriesSet = new Set(series);

			seriesSet.forEach(async (item) => {
				if (item) await loadImage(`icons/pin/${item}.png`, item);
			});
		};

		map.on("load", () => {
			const markers: Marker[] = JSON.parse(this.dataset.markers ?? "[]");

			loadAllImages(markers.map((m) => m.series.join("-"))).then(() => {
				// Add a GeoJSON source
				map.addSource("circuits", {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: markers.map((m) => {
							return {
								type: "Feature",
								geometry: {
									type: "Point",
									coordinates: [m.lon, m.lat]
								},
								properties: {
									description: `<h4>${m.title}</h4><p>${m.series.join(", ")}</p>`,
									icon: m.series.join("-")
								}
							};
						})
					}
				});

				// Add a symbol layer
				map.addLayer({
					id: "circuits",
					type: "symbol",
					source: "circuits",
					layout: {
						"icon-image": "{icon}",
						"icon-size": 0.5,
						"icon-offset": [0, -16],
						"icon-overlap": "always"
					}
				});

				// When a click event occurs on a feature in the circuits layer, open a popup at the
				// location of the feature, with description HTML from its properties.
				map.on("click", "circuits", (e) => {
					let [x, y] = (e.features?.at(0)?.geometry as Point).coordinates.slice();
					const description = e.features?.at(0)?.properties.description;

					// Ensure that if the map is zoomed out such that multiple
					// copies of the feature are visible, the popup appears
					// over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - x) > 180) {
						x += e.lngLat.lng > x ? 360 : -360;
					}

					new Popup().setLngLat([x, y]).setHTML(description).addTo(map);
				});

				// Change the cursor to a pointer when the mouse is over the circuits layer.
				map.on("mouseenter", "circuits", () => {
					map.getCanvas().style.cursor = "pointer";
				});

				// Change it back to a pointer when it leaves.
				map.on("mouseleave", "circuits", () => {
					map.getCanvas().style.cursor = "";
				});
			});
		});
	}
}

customElements.define("map-libre", MapLibre);
