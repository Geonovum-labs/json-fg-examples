import {
  AddRDNewTransformation,
  InitializeMap,
  addFeaturesToMapFromGeoJSON,
  AddPopupToLayer,
} from "./scripts/openlayers-map.js";
import { DateRangeControl } from "./scripts/date-range-control.js";

// The json data wasn't in RD New, even though its metadata says so.
AddRDNewTransformation();
globalThis.map = InitializeMap(
  "map-root",
  "./json-examples/gemeenten_with_geometry.jsonfg"
);
AddPopupToLayer(map);

async function addJsonFeatureLayer() {
  // const geojsonResponse = await fetch("./json-examples/gemeentes.jsonfg");
  const geojsonResponse = await fetch(
    "./json-examples/gemeenten_with_geometry.jsonfg"
  );
  // const geojsonResponse = await fetch("./json-examples/simple-shapes.geojson");
  const geojsonString = await geojsonResponse.text();

  addFeaturesToMapFromGeoJSON(map, geojsonString);

  const daterangeControl = new DateRangeControl({ layername: "json-fg layer" });
  map.addControl(daterangeControl);
  daterangeControl.updateFilteredFeatures();
}

addJsonFeatureLayer();
