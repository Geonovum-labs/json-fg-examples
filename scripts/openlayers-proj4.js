/**
 * Add a transformation to support a non-default Coordinate System.
 * By default OpenLayers supports WGS84 and Web Mercator, other systems need to be added like this.
 *
 * You can get these for your projection here:
 * * Go to: https://epsg.io/28992 (replace epsg code)
 * * Then go to the proj4js export option and copy from there.
 *
 * Based mostly on comment from ThomasG77 here:
 * https://gis.stackexchange.com/questions/398379/how-to-transform-openlayers-coordinate-projection.
 * His example is great because the OpenLayers and proj4.js docs don't really show how to integrate them.
 */
export function addOpenLayersTransformation(epsgCode, transformationString) {
  // Check if the code is already defined.
  if (proj4(epsgCode)) {
    console.log("overwriting proj4 tranformation: " + epsgCode);
  }
  proj4.defs(epsgCode, transformationString);

  // Then give proj4 with its transformations to openlayers.
  // Needs to be registered once on app startup, doesn't hurt to call multiple times though.
  ol.proj.proj4.register(proj4);
}

/**
 * Defines the transformation of the Dutch EPSG:28992 system.
 * This example project uses that system to load Dutch municipalities from json in those coordinates.
 *
 * Source: https://epsg.io/28992
 */
export function addRDNewTransformation() {
  // This line loads a transformation that approximates the EPSG:28992 transformation.
  // IIRC you can make this Dutch RD New system more precise (like 10 meters) by loading a grid of deviations from this approximation.
  proj4.defs(
    "EPSG:28992",
    "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs"
  );
  ol.proj.proj4.register(proj4);
}
