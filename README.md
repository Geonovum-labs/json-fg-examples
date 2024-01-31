Example website that shows how to use JSON-FG in a web map with time and CRS support

The website uses vanilla javascript, without a compilation step.
This makes it easier for beginner programmers to get it running.

The example website uses a custom openlayers Format for JSON-FG to read the features.
It is a simple extension of the format from GeoJSON.js.  
Some info on how to create a custom ol.Format:  
https://github.com/openlayers/openlayers/tree/main/src/ol/format

## More info on JSON-FG

The current Geonovum test repo for JSON-FG examples  
https://github.com/Geonovum-labs/test-ogc-json-fg

Its github pages output  
https://geonovum-labs.github.io/test-ogc-json-fg

OGC Features and Geometries JSON repo of the standard  
https://github.com/opengeospatial/ogc-feat-geo-json

Geonovum presentation about JSON-FG  
https://www.geonovum.nl/uploads/documents/220405-JSON-FG.pdf

GDAL JSON-FG docs  
https://gdal.org/drivers/vector/jsonfg.html

## method

Based on this OpenLayers example  
https://openlayers.org/en/latest/examples/accessible.html

Copied simple-shapes.geojson from here  
https://gist.github.com/wavded/1200773?short_path=99c1af9

Copied gemeenten_selectie.jsonfg from here  
https://github.com/Geonovum-labs/test-ogc-json-fg/blob/main/testresults/gemeenten_with_geometry.json  
However I cut off most municipalities to have a small filesize.

Openlayers filter features by date example  
https://openlayers.org/en/latest/examples/filter-points-webgl.html

## TODO

Explain how i modified timeslider (original is copyrighted):
https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816

Recommend using "" instead of "..". Because ".." is not falsy.
Show conflict with GeoJSON format on hardcoded geometry column.

Test whether the property feature.place is now correctly used instead of feature.geometry
Organize the different map functionality a little better
