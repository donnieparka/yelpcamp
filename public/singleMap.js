mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: campground, // starting position [lng, lat]
	zoom: 9, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
const marker = new mapboxgl.Marker().setLngLat(campground).addTo(map);
