const mapbox = mapboxgl // eslint-disable-line
const nameDisplay = document.getElementById("name")
const unitsDisplay = document.getElementById("units")

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

let hoveredFeatId = null
map.on("load", () => {
  // Set a specific ID field so all feature ids are unique beyond their tile
  map.addSource("ihs_rollup_source", {
    type: "vector",
    url: "mapbox://housingstudies.98grrlnk",
    promoteId: "name",
  })

  // Change feature fill-opacity depending on hover state
  map.addLayer({
    id: "ihs-fills",
    type: "fill",
    source: "ihs_rollup_source",
    "source-layer": "ihs_rollup-2jzfoj",
    paint: {
      "fill-color": "#749C75",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        0,
      ],
    },
  })

  // TODO: Change feature line-color depending on clicked state
  map.addLayer({
    id: "ihs-borders",
    type: "line",
    source: "ihs_rollup_source",
    "source-layer": "ihs_rollup-2jzfoj",
    paint: {
      "line-color": "#000000",
      "line-width": 2,
    },
  })

  let mapFeatSources = {
    source: "ihs_rollup_source",
    sourceLayer: "ihs_rollup-2jzfoj",
    id: hoveredFeatId,
  }

  // Update the feature state for the feature under the mouse, when hovering.
  map.on("mousemove", "ihs-fills", (e) => {
    if (e.features.length > 0) {
      if (hoveredFeatId !== null) {
        map.setFeatureState({ ...mapFeatSources }, { hover: false })
      }

      const hoveredFeat = e.features[0]
      hoveredFeatId = hoveredFeat.id
      map.setFeatureState({ ...mapFeatSources }, { hover: true })

      nameDisplay.innerText = hoveredFeat.properties.name
      unitsDisplay.innerText = parseInt(
        hoveredFeat.properties.Total
      ).toLocaleString("en")

      map.getCanvas().style.cursor = "pointer"
    }
  })

  // Set previous feature's hover state back to false when leaving
  map.on("mouseleave", "ihs-fills", () => {
    if (hoveredFeatId !== null) {
      map.setFeatureState({ ...mapFeatSources }, { hover: false })
    }
    hoveredFeatId = null
    nameDisplay.innerText = ""
    unitsDisplay.innerText = ""

    map.getCanvas().style.cursor = ""
  })

  map.on("click", "ihs-fills", (e) => {
    const clickedFeat = e.features[0]
    const props = clickedFeat.properties
    const description = `
      <div class="m-2">
        <p class="h4">${props.name}</p>
        <ul class="list-unstyled mb-0">
          <li>Total Units: ${parseInt(props["Total"]).toLocaleString("en")}</li>
          <li>Percent Multifamily: ${props["UmultiFam"]}</li>
        </ul>
        <hr aria-hidden="true">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Housing Type</th>
              <th scope="col">Value</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Single Family</td>
              <td>${formatUnits(props["SFH"])}</td>
              <td>${props["SFH_p"]}</td>
            </tr>
            <tr>
              <td>Condo</td>
              <td>${formatUnits(props["Condo"])}</td>
              <td>${props["Condo_p"]}</td>
            </tr>
            <tr>
              <td>2 - 4 Units</td>
              <td>${formatUnits(props["2to4"])}</td>
              <td>${props["2to4_p"]}</td>
            </tr>
            <tr>
              <td>5 - 49 Units</td>
              <td>${formatUnits(props["U5to49"])}</td>
              <td>${props["U5to49_p"]}</td>
            </tr>
            <tr>
              <td>50+ Units</td>
              <td>${formatUnits(props["U50"])}</td>
              <td>${props["U50_p"]}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `

    // Add popup at cursor position when feature is clicked
    new mapbox.Popup().setLngLat(e.lngLat).setHTML(description).addTo(map)
  })
})

function formatUnits(value) {
  return value ? parseInt(value).toLocaleString("en") : "0"
}
