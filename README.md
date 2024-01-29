Example website that shows how to use JSON-FG in a web map with time and CRS support

Will use a vanilla javascript for the website. This makes it easier for beginner programmers to get it running. Maybe i'll add an identical example to show how to do the same with a bundler.
Will also add a simple Node.js API (express) to show how to serve json data.

Will add an example of a GDAL command to save your data as json-fg.
Just the commandline command (gdal >3.8)

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

Finish filtering of features based on timeslider
Revert timeslider to native elements
Add example of generating json-fg with GDAL
Try background map from PDOK
Show how to use https://epsg.io/28992  
Explain how i used:

- https://openlayers.org/en/latest/examples/popup.html
- https://openlayersbook.github.io/index.html
- https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816

Add text area for json-fg
Add text area for coordinate transformation string to go with the json-fg
Add a linter on the text area for json-fg
