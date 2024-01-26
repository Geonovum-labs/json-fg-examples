// In a larger project you'd import dependencies like this, but this requires a bundler setup
// For this simple example I used an import of ol.js in the HTML.
// import Map from "ol/Map.js";
// import OSM from "ol/source/OSM.js";
// import TileLayer from "ol/layer/Tile.js";
// import View from "ol/View.js";
// import {defaults as defaultControls} from 'ol/control.js';
import { DateRangeControl } from "./date-range-control.js";

/** Copy-pasta from OL example. */
export function InitializeMap(targetDivId) {
  const map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    target: targetDivId,
    view: new ol.View({
      // EPSG:3857 (Web Mercator) is the default View projection. (fastest in browsers for world-wide data, not precise)
      projection: "EPSG:28992",
      center: [0, 0],
      zoom: 2,
    }),
    controls: ol.control.defaults.defaults().extend([new DateRangeControl()]),
  });

  // Add the example map to the global scope for debugging from the browser.
  window.exampleMap = map;
  return map;
}

/**
 * This transformation is an example of how you'd visualize coordinates that are not WGS84 or Web Mercator.
 * It just registers the transformation so that any loaded source of OpenLayers data can use it.
 *
 * Needs to be run once on app startup.
 * Defines the transformation of the Dutch EPSG:28992 system
 * This example project uses that system to load Dutch municipalities from json in those coordinates.
 *
 * Based mostly on comment from ThomasG77 here:
 * https://gis.stackexchange.com/questions/398379/how-to-transform-openlayers-coordinate-projection
 * His example is great because the OpenLayers and proj4.js docs don't really show how to integrate them.
 */
export function AddRDNewTransformation() {
  // This line loads an approximation of the transformation from 28992
  // IIRC you can make it (like 10 meters) more precise by loading a grid of deviations from this approximation.
  // You can get these for your projection here:
  // https://epsg.io/28992
  // Then go to the proj4js export option and copy from there.
  // From ThomasG77 example:
  // proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
  // Most recent epsg.io transformation for 28992:
  proj4.defs(
    "EPSG:28992",
    "+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,1.9342,-1.6677,9.1019,4.0725 +units=m +no_defs +type=crs"
  );

  // By default openlayers knows how to convert coordinates between:
  // EPSG:4326 (WGS84) and EPSG:3857 (Web Mercator)
  // Source: https://openlayers.org/en/latest/apidoc/module-ol_proj_Projection-Projection.html

  // Then give all loaded transformations to openlayers.
  ol.proj.proj4.register(proj4);
}

/** Copy-pasta from OL example. */
function styleFunction(feature) {
  return styles[feature.getGeometry().getType()];
}

/**
 * @param {ol.Map} map
 * @param {ArrayBuffer | Document | Element | Object | string} geojsonSource Can be many types of input data. Easiest is to provide as json string.
 */
export function addFeaturesToMapFromGeoJSON(map, geojsonSource) {
  // JSON-FG is a superset of geojson
  // However the geojson format doesn't support reading from anything other than EPSG:4326
  // Any projections given to the format are ignored.
  // https://gis.stackexchange.com/questions/442177/include-crs-information-in-geojson-features-created-by-openlayers-geojson-forma
  const geojson = new ol.format.GeoJSON();

  // Thus the projection needs to be done server side to 4326 or with custom code like in this example.
  // Server-side is usually better for production, however there can be plenty reasons to do it client-side.
  // And then it's easiest when reading features, since their sources could have different coordinate systems.
  // Docs for GeoJSON readFeatures: https://openlayers.org/en/latest/apidoc/module-ol_format_GeoJSON-GeoJSON.html
  const features = geojson.readFeatures(geojsonSource, {
    dataProjection: "EPSG:4326",
    featureProjection: map.getView().getProjection(),
  });

  // You could instead transform each feature separately, probably not fast though.
  // for (let i = 0; i < features.length; i++) {
  //   const feature = features[i];
  //   feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
  // }

  const vectorSource = new ol.source.Vector();
  vectorSource.addFeatures(features);

  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction,
  });

  map.addLayer(vectorLayer);

  // Add vector layer to global scope to debug from browser console.
  // Add features to global scope to debug from browser console.
  window.vectorFeatures = features;
  window.vectorLayer = vectorLayer;

  // Make features tab selectable
  // Not relevant for json-fg, just something I wanted to try.
  // const selectInteraction = new ol.interaction.Select({
  //   style: magentaFeaturesStyle,
  // });
  // map.addInteraction(selectInteraction);
  // for (let i = 0; i < features.length; i++) {
  //   const feature = features[i];

  //   const parent = document.getElementById("selectable-features");
  //   const child = document.createElement("div");
  //   const naam = feature.getProperties().naam;
  //   child.id = naam;
  //   child.tabIndex = 0;
  //   child.addEventListener("focus", (e) => {
  //     selectInteraction.getFeatures().push(feature);
  //   });
  //   child.addEventListener("focusout", (e) => {
  //     selectInteraction.getFeatures().remove(feature);
  //   });
  //   parent.appendChild(child);
  // }

  // Zoom to Layer
  const extent = vectorSource.getExtent();
  map.getView().fit(extent);
  // Zoom out a little
  map.getView().setZoom(map.getView().getZoom() - 1);
}

export function AddPopupToLayer(map) {
  const popupEle = document.createElement("div");
  // Style for the popup is defined in index.css
  popupEle.className = "popup";

  const popupOverlay = new ol.Overlay({
    element: popupEle,
    autoPan: true,
  });

  map.addOverlay(popupOverlay);

  map.on("click", function (e) {
    popupOverlay.setPosition(e.coordinate);

    const features = [];
    let lastFeatureProps = { naam: "Nothing here." };
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
      features.push(feature);
      lastFeatureProps = feature.getProperties();
    });

    popupEle.innerText = lastFeatureProps.naam;
  });
}

const pointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({ color: "red", width: 1 }),
  }),
});
const greenStrokeStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "green",
    width: 1,
  }),
});
const yellowFillStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "yellow",
    lineDash: [4],
    width: 1,
  }),
  fill: new ol.style.Fill({
    color: "rgba(255, 255, 0, 0.1)",
  }),
});
const blueFillStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "blue",
    width: 3,
  }),
  fill: new ol.style.Fill({
    color: "rgba(0, 0, 255, 0.1)",
  }),
});
const magentaFeaturesStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "magenta",
    width: 2,
  }),
  fill: new ol.style.Fill({
    color: "magenta",
  }),
  image: new ol.style.Circle({
    radius: 10,
    fill: null,
    stroke: new ol.style.Stroke({
      color: "magenta",
    }),
  }),
});
const redFillStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "red",
    width: 2,
  }),
  fill: new ol.style.Fill({
    color: "rgba(255,0,0,0.2)",
  }),
});

// This is not a style like the ones above
// This comes from a WebGL filtered layer example
// https://openlayers.org/en/latest/examples/filter-points-webgl.html
// const blueFillStyleWithFilter = {
//   variables: {
//     minYear: 1850,
//     maxYear: 2015,
//   },
//   filter: ['between', ['get', 'year'], ['var', 'minYear'], ['var', 'maxYear']],
//   'circle-radius': [
//     '*',
//     ['interpolate', ['linear'], ['get', 'mass'], 0, 4, 200000, 13],
//     ['-', 1.75, ['*', animRatio, 0.75]],
//   ],
//   'circle-fill-color': [
//     'interpolate',
//     ['linear'],
//     animRatio,
//     0,
//     newColor,
//     1,
//     oldColor,
//   ],
//   'circle-opacity': ['-', 1.0, ['*', animRatio, 0.75]],
// };

const styles = {
  Point: pointStyle,
  LineString: greenStrokeStyle,
  MultiLineString: greenStrokeStyle,
  MultiPoint: pointStyle,
  MultiPolygon: yellowFillStyle,
  Polygon: blueFillStyle,
  GeometryCollection: magentaFeaturesStyle,
  Circle: redFillStyle,
};
