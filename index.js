import {
  AddRDNewTransformation,
  InitializeMap,
  addFeaturesToMapFromGeoJSON,
  AddPopupToLayer,
} from "./scripts/openlayers-map.js";

// The json data wasn't in RD New, even though its metadata says so.
AddRDNewTransformation();
const map = InitializeMap("map-root");
AddPopupToLayer(map);

async function addJsonFeatures() {
  const geojsonResponse = await fetch("./json-examples/gemeentes.jsonfg");
  // const geojsonResponse = await fetch("./json-examples/gemeenten_with_geometry.jsonfg");
  // const geojsonResponse = await fetch("./json-examples/simple-shapes.geojson");
  const geojsonString = await geojsonResponse.text();

  addFeaturesToMapFromGeoJSON(map, geojsonString);
}

addJsonFeatures();
