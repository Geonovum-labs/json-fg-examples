// If JSON-FG is accepted by the OGC then they would add a JSON-FG format, somewhat like this one, here:
// https://github.com/openlayers/openlayers/tree/main/src/ol/format

import { readGeometryInternal } from "./geojson-format.js";

/**
 * Custom feature format for reading and writing data in the JSON-FG format.
 *
 * This custom format doesn't fully implement the JSON-FG standard as it was made for just this example.
 * https://gdal.org/drivers/vector/jsonfg.html
 *
 * JSON-FG is a superset of GeoJSON.
 * However, the GeoJSON format only supports the coördinate system EPSG:4326.
 * Any projections given to the formats constructor are ignored.
 * https://gis.stackexchange.com/questions/442177/include-crs-information-in-geojson-features-created-by-openlayers-geojson-forma
 */
export class JsonFG extends ol.format.GeoJSON {
  readFeaturesFromObject(object, options) {
    options = options ? options : {};

    // Read source dataProjection and set it as the dataProjection option.
    if (!options.dataProjection) {
      options.dataProjection = this.readProjectionFromObject(object);
      if (!options.dataProjection) {
        console.log(
          `Missing transformation for the CRS ${crs} of the json-fg file.\n` +
            'This can be added with proj4.defs("EPSG:28992", transformationString);'
        );
      }
    }

    return super.readFeaturesFromObject(object, options);
  }

  readFeatureFromObject(object, options) {
    // Object is the feature object from JSON and contains the time and place.
    // The GeoJSON format would ignore those properties.

    // Call super.readFeatureFromObject() with a json-fg fix:
    const feature = this.superReadFeatureFromObject(object, options);

    const featureTime = object.time;
    if (featureTime) {
      // Fix nullish value of interval
      if (featureTime.interval) {
        if (featureTime.interval[0] === "..") {
          featureTime.interval[0] = undefined;
        }
        if (featureTime.interval[1] === "..") {
          featureTime.interval[1] = undefined;
        }
      }
    }
    feature.set("time", featureTime);

    return feature;
  }

  /**
   * Okay so this is a hacky fix..
   * I've overridden super.readFeatureFromObject() by copy-pasting it with ONE edit.
   * I've made it accept a jsonGeometryName from the options.
   */
  superReadFeatureFromObject(object, options) {
    let geoJSONFeature = null;
    if (object["type"] === "Feature") {
      geoJSONFeature = /** @type {GeoJSONFeature} */ (object);
    } else {
      geoJSONFeature = {
        type: "Feature",
        geometry: /** @type {GeoJSONGeometry} */ (object),
        properties: null,
      };
    }

    const geometry = readGeometryInternal(
      geoJSONFeature["place"], // JSON-FG uses place instead of geometry.
      options
    );
    if (this.featureClass === ol.render.Feature) {
      return createRenderFeature(
        {
          geometry,
          id: geoJSONFeature["id"],
          properties: geoJSONFeature["properties"],
        },
        options
      );
    }

    const feature = new ol.Feature();
    if (this.geometryName_) {
      feature.setGeometryName(this.geometryName_);
    } else if (this.extractGeometryName_ && geoJSONFeature["geometry_name"]) {
      feature.setGeometryName(geoJSONFeature["geometry_name"]);
    }
    feature.setGeometry(ol.format.Feature.createGeometry(geometry, options));

    if ("id" in geoJSONFeature) {
      feature.setId(geoJSONFeature["id"]);
    }

    if (geoJSONFeature["properties"]) {
      feature.setProperties(geoJSONFeature["properties"], true);
    }

    return feature;
  }

  /**
   * Supports recognition of the projection based on coordRefSys (JSON-FG spec).
   * * If not available falls back to crs (from old GeoJSON spec).
   * * Finally, if both not available, falls back to EPSG:4326 (JSON-FG default).
   */
  readProjectionFromObject(object) {
    let projection;

    // Prefer the JSON-FG standard if available.
    let crs = object["coordRefSys"];
    if (crs) {
      // The example file I used was generated with ogr2ogr and had "[EPSG:28992]" as coordRefSys.
      // However that is invalid according to https://docs.ogc.org/DRAFTS/21-045.html#schema-coordrefsys
      // This part of the standard might still be uncertain?
      crs = crs.replace(/[\[\]]/g, "");
      projection = ol.proj.get(crs);
    }
    if (!projection) {
      projection = super.readProjectionFromObject(object);

      // Use the JSON-FG default if neither is available.
      if (!projection) {
        projection = ol.proj.get("EPSG:4326");
      }
    }

    return projection;
  }
}
