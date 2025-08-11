const mapbox = mapboxgl // eslint-disable-line

mapbox.accessToken =
  "pk.eyJ1IjoiaG91c2luZ3N0dWRpZXMiLCJhIjoiY21jbmZ4MWFjMDZ1cjJrcHBhNHY2aTkwbiJ9.t-q8Z7FV6gdGhztkwKTeAA"
const map = new mapbox.Map({
  container: "map",
  style: "mapbox://styles/housingstudies/cmcb0c6ql002001rz02zqewvm",
  center: [-87.66231, 41.85754], // [lng, lat]
  zoom: 12,
})

// Zoom and rotation controls
map.addControl(new mapbox.NavigationControl(), "top-left")
map.scrollZoom.disable()
