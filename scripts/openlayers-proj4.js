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
export function addOpenLayersTransformation(crs_id, transformationString) {
  try {
    // Check if the epsg code is already defined.
    // Will throw an error if not.
    proj4(crs_id);
    console.log("overwriting proj4 tranformation: " + crs_id);
  } catch (e) {}

  proj4.defs(crs_id, transformationString);

  // Then give proj4 with its transformations to openlayers.
  // Needs to be registered once on app startup, doesn't hurt to call multiple times though.
  ol.proj.proj4.register(proj4);
}
