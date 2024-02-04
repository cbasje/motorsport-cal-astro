import type { SeriesId } from "$db/types";
import { Map, Popup } from "maplibre-gl";
import type { Point } from "geojson";

type Marker = {
	firstRound: string;
	title: string;
	series: SeriesId[];
	lat: number | null;
	lon: number | null;
};

class MapLibre extends HTMLElement {
	constructor() {
		super();

		const latlng: [number, number] = [
			Number(this.dataset.latitude),
			Number(this.dataset.longitude),
		];

		const map = new Map({
			container: "map",
			style: this.dataset.tiles ?? "",
			// attributionControl: false,
			center: latlng ?? [0, 0],
			zoom: Number(this.dataset.zoom),
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
				if (item) await loadImage(`images/pin/${item}.png`, item);
			});
		};

		map.on("load", () => {
			const markers: Marker[] = JSON.parse(this.dataset.markers ?? "[]");

			loadAllImages(markers.map((m) => m.series.join("-"))).then(() => {
				// Add a GeoJSON source
				map.addSource("circuits", {
					type: "geojson",
					cluster: true,
					clusterMaxZoom: 12,
					clusterRadius: 25,
					data: {
						type: "FeatureCollection",
						features: markers.map((m) => {
							return {
								type: "Feature",
								geometry: {
									type: "Point",
									coordinates: [m.lon, m.lat],
								},
								properties: {
									firstRound: m.firstRound,
									title: m.title,
									series: [...new Set(m.series)].join(", "),
									icon: m.series.join("-"),
								},
							};
						}),
					},
				});

				// Add a symbol layer
				// map.addLayer({
				// 	id: "circuits",
				// 	type: "symbol",
				// 	source: "circuits",
				// 	layout: {
				// 		"icon-image": "{icon}",
				// 		"icon-size": 0.5,
				// 		"icon-offset": [0, -16],
				// 		"icon-overlap": "always",
				// 	},
				// });

				map.addLayer({
					id: "clusters",
					type: "circle",
					source: "circuits",
					filter: ["has", "point_count"],
					paint: {
						// Use step expressions (https://maplibre.org/maplibre-style-spec/#expressions-step)
						// with three steps to implement three types of circles:
						//   * Blue, 20px circles when point count is less than 100
						//   * Yellow, 30px circles when point count is between 100 and 750
						//   * Pink, 40px circles when point count is greater than or equal to 750
						"circle-color": [
							"step",
							["get", "point_count"],
							"#51bbd6",
							3,
							"#f1f075",
							5,
							"#f28cb1",
						],
						"circle-radius": ["step", ["get", "point_count"], 20, 2, 30, 5, 40],
					},
				});
				map.addLayer({
					id: "cluster-count",
					type: "symbol",
					source: "circuits",
					filter: ["has", "point_count"],
					layout: {
						"text-field": "{point_count_abbreviated}",
						"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
						"text-size": 12,
					},
				});
				map.addLayer({
					id: "unclustered-point",
					type: "circle",
					source: "circuits",
					filter: ["!", ["has", "point_count"]],
					paint: {
						"circle-color": "#11b4da",
						"circle-radius": 4,
						"circle-stroke-width": 1,
						"circle-stroke-color": "#fff",
					},
				});

				// inspect a cluster on click
				map.on("click", "clusters", (e) => {
					const features = map.queryRenderedFeatures(e.point, {
						layers: ["clusters"],
					});
					const clusterId = features[0].properties.cluster_id;
					map.getSource("circuits")?.getClusterExpansionZoom(clusterId, (err, zoom) => {
						if (err) return;

						map.easeTo({
							center: (features[0].geometry as Point).coordinates,
							zoom,
						});
					});
				});

				// When a click event occurs on a feature in
				// the unclustered-point layer, open a popup at
				// the location of the feature, with
				// description HTML from its properties.
				map.on("click", "unclustered-point", (e) => {
					let [x, y] = (e.features?.at(0)?.geometry as Point).coordinates.slice();
					const properties = e.features?.at(0)?.properties;

					// Ensure that if the map is zoomed out such that
					// multiple copies of the feature are visible, the
					// popup appears over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - x) > 180) {
						x += e.lngLat.lng > x ? 360 : -360;
					}

					new Popup({
						closeButton: false,
					})
						.setLngLat([x, y])
						.setHTML(
							`
								<h4>${properties?.title}</h4>
								<p>${properties?.series}</p>
								<a href="/round/${properties?.firstRound}" class="btn btn-color">First Round!</a>
							`
						)
						.addTo(map);
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
