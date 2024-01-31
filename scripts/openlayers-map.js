// In a larger project you'd import dependencies like this, but this requires a bundler setup
// For this simple example I used an import of ol.js in the HTML.
// import Map from "ol/Map.js";
// import OSM from "ol/source/OSM.js";
// import TileLayer from "ol/layer/Tile.js";
// import View from "ol/View.js";
// import {defaults as defaultControls} from 'ol/control.js';
import { JsonFG } from "./json-fg-format.js";
import { getPolygonStyle } from "./openlayers-styles.js";

/** Copy-pasta from OL example. */
export function initializeMap(targetDivId) {
  const map = new ol.Map({
    target: targetDivId,
    view: new ol.View({
      // EPSG:3857 (Web Mercator) is the default View projection. (fastest in browsers for world-wide data, not precise)
      // projection: "EPSG:28992", only possible after adding 28992 tranformation
      center: [0, 0],
      zoom: 2,
    }),
    controls: ol.control.defaults.defaults(),
  });

  return map;
}

/**
 * @param {ArrayBuffer | Document | Element | Object | string} jsonSource Can be many types of input data. Easiest is to provide as json string.
 * @param {string} coordinateSystemCode default: "EPSG:4326"
 * @returns {ol.source.Vector} vectorSource
 */
export function readJsonFGFeatures(jsonSource) {
  // JSON-FG as a filetype is not known by OpenLayers, so we use a custom format.
  // Otherwise it would have used: new ol.format.GeoJSON()
  const jsonfgFormat = new JsonFG();

  // Thus the projection needs to be done server side to 4326 or with custom code like in this example.
  // Server-side is usually better for production, however there can be plenty reasons to do it client-side.
  // And then it's easiest when reading features, since their sources could have different coordinate systems.
  // Docs for GeoJSON readFeatures: https://openlayers.org/en/latest/apidoc/module-ol_format_GeoJSON-GeoJSON.html
  const features = jsonfgFormat.readFeatures(jsonSource, {
    // Will make sure to make these two options unnessary.
    // For that the format needs to read the projection from JSON.
    // dataProjection: "EPSG:4326",
    featureProjection: map.getView().getProjection(),
  });

  const vectorSource = new ol.source.Vector();
  vectorSource.addFeatures(features);

  return vectorSource;
}

/**
 * @param {ol.Map} map
 */
export function addEmptyVectorLayer(map, layername) {
  // Move this documentation of properties that moved:
  //{ArrayBuffer | Document | Element | Object | string} jsonSource Can be many types of input data. Easiest is to provide as json string.
  //{string} coordinateSystemCode default: "EPSG:4326"
  const vectorLayer = new ol.layer.Vector();

  vectorLayer.set("name", layername);
  map.addLayer(vectorLayer);

  return vectorLayer;
}

export function addTabFeatureSelection() {
  // Make features tab selectable
  // Not relevant for json-fg, just something I wanted to try.
  const selectInteraction = new ol.interaction.Select({
    style: getPolygonStyle("magenta", "rgba(255, 0, 255, 0.1)"),
  });
  map.addInteraction(selectInteraction);
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];

    const parent = document.getElementById("selectable-features");
    const child = document.createElement("div");
    const naam = feature.getProperties().naam;
    child.id = naam;
    child.tabIndex = 0;
    child.addEventListener("focus", (e) => {
      selectInteraction.getFeatures().push(feature);
    });
    child.addEventListener("focusout", (e) => {
      selectInteraction.getFeatures().remove(feature);
    });
    parent.appendChild(child);
  }
}

export function zoomToLayer(layer) {
  const layerSource = layer.getSource();
  const extent = layerSource.getExtent();
  map.getView().fit(extent);
  // Zoom out a little
  map.getView().setZoom(map.getView().getZoom() - 0.4);
}

/** Based on: https://openlayers.org/en/latest/examples/popup.html */
export function addPopupToLayer(map) {
  const popupEle = document.createElement("div");
  // Style for the popup is defined in index.css
  popupEle.className = "popup";

  const popupOverlay = new ol.Overlay({
    element: popupEle,
    autoPan: true,
  });

  map.addOverlay(popupOverlay);

  map.on("click", function (e) {
    const features = [];
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
      features.push(feature);
    });
    const municipalities = features.map((f) => {
      return { name: f.get("naam"), from: f.get("begingeldigheid") };
    });

    const feature = features[features.length - 1];
    if (!feature) {
      popupOverlay.setPosition(undefined);
      return;
    }

    const featureProps = feature.getProperties();
    console.log("Props of clicked feature:");
    console.log(featureProps);

    popupEle.innerText = municipalities
      .map((mun) => `Gemeente: ${mun.name} - sinds ${mun.from}`)
      .join("\n");
    popupOverlay.setPosition(e.coordinate);
  });
}
