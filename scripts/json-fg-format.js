// If JSON-FG is accepted by the OGC then they would add a JSON-FG format, somewhat like this one, here:
// https://github.com/openlayers/openlayers/tree/main/src/ol/format

/**
 * Feature format for reading and writing data in the JSON-FG format.
 *
 * JSON-FG is a superset of GeoJSON.
 * However, the GeoJSON format only supports the coördinate system EPSG:4326.
 * Any projections given to the formats constructor are ignored.
 * https://gis.stackexchange.com/questions/442177/include-crs-information-in-geojson-features-created-by-openlayers-geojson-forma
 *
 * TODO: Add support for a custom projection.
 */
export class JsonFG extends ol.format.GeoJSON {
  readFeatureFromObject(object, options) {
    // Object is the object from JSON and contains time and place.
    // The GeoJSON format would ignore those properties.

    const feature = super.readFeatureFromObject(object, options);

    const featureTime = object.time;
    if (featureTime.interval[0] === "..") {
      featureTime.interval[0] = undefined;
    }
    if (featureTime.interval[1] === "..") {
      featureTime.interval[1] = undefined;
    }
    feature.set("time", featureTime);
    feature.set("place", object.place);
    return feature;
  }
}
