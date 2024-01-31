import {
  initializeMap,
  addJsonFGAsVectorLayer,
  addPopupToLayer,
  zoomToLayer,
  readJsonFGFeatures,
} from "./scripts/openlayers-map.js";
import { DateRangeControl } from "./scripts/date-range-control.js";
import { initializeEditors } from "./scripts/code-editor/codemirror.js";
import { addPDOKTileLayer } from "./scripts/pdok-tilelayer.js";
import { addOSMTileLayer } from "./scripts/osm-tilelayer.js";
import { addOpenLayersTransformation } from "./scripts/openlayers-proj4.js";

// TODO:
// Apply changes to json and crs
// Restore setting the map view to EPSG:28992
// Organize the different map functionality a little better

async function main() {
  const map = initializeMap(
    "map-root",
    "./json-examples/gemeenten_with_geometry.jsonfg"
  );

  // addOSMTileLayer(map);
  await addPDOKTileLayer(map);

  // Add the example map to the global scope for debugging from the browser.
  globalThis.map = map;

  addPopupToLayer(map);

  // Here We'll fetch JSON-FG data and add it as a vectorlayer to OpenLayers.
  // JSON-FG extends geojson with support for coordinate systems other than WGS84.
  // And since OpenLayers only supports WGS84 and Web Mercator it needs to be extended.

  // In this example we use a transformation string entered by the user.
  // However, normally you'd just copy your tranformation definition from EPSG and paste it in the code.
  // In this example we're using RD New, the Dutch coordinate system.

  // const geojsonResponse = await fetch("./json-examples/gemeentes.jsonfg");
  const geojsonResponse = await fetch(
    "./json-examples/gemeenten_with_geometry.jsonfg"
  );
  // const geojsonResponse = await fetch("./json-examples/simple-shapes.geojson");
  const geojsonString = await geojsonResponse.text();

  const jsonLayer = addJsonFGAsVectorLayer(
    map,
    "json-fg layer",
    geojsonString,
    "EPSG:4326"
  );
  zoomToLayer(jsonLayer);

  const daterangeControl = new DateRangeControl({ layername: "json-fg layer" });
  map.addControl(daterangeControl);
  daterangeControl.updateFilteredFeatures();

  async function onJsonChange(e) {
    const newSource = readJsonFGFeatures(e.getValue(), "EPSG:4326");
    jsonLayer.setSource(newSource);
  }

  function onCrsChange(e) {
    const epsgInput = document.getElementById("epsg_input");

    addOpenLayersTransformation(epsgInput.value, e.getValue());
  }

  initializeEditors(
    geojsonString,
    "+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,1.9342,-1.6677,9.1019,4.0725 +units=m +no_defs +type=crs",
    onJsonChange,
    onCrsChange
  );
}

main();
