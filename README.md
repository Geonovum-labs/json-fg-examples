This is an example of how JSON-FG data can be shown in an Openlayers
map. It shows the shape of Dutch municipality borders over time.

The website is built as vanilla javascript, without a compilation step.
This makes it easier for beginner programmers to get it running.

Openlayers has Geojson support but that is not enough for the time and coordinate system additions of JSON-FG. To make this possible a custom JSON-FG format is included that partially implements JSON-FG.
Some info on how to create a custom ol.Format:  
https://github.com/openlayers/openlayers/tree/main/src/ol/format
The format only supports time.interval from JSON-FG. If it uses time.date or time.timestamp the timeslider does nothing.

## More info on JSON-FG

The current Geonovum test repo for JSON-FG examples  
https://github.com/Geonovum-labs/test-ogc-json-fg

Its github pages output  
https://geonovum-labs.github.io/test-ogc-json-fg

OGC Features and Geometries JSON repo of the standard  
https://github.com/opengeospatial/ogc-feat-geo-json  
It also has examples of special geometry in JSON-FG  
https://github.com/opengeospatial/ogc-feat-geo-json/tree/main/core/examples

Geonovum presentation about JSON-FG  
https://www.geonovum.nl/uploads/documents/220405-JSON-FG.pdf

GDAL docs on the JSON-FG standard:  
https://gdal.org/drivers/vector/jsonfg.html

## method

Based on this OpenLayers example  
https://openlayers.org/en/latest/examples/accessible.html

Copied simple-shapes.geojson from here  
https://gist.github.com/wavded/1200773?short_path=99c1af9

Copied gemeenten_selectie.jsonfg from here  
https://github.com/Geonovum-labs/test-ogc-json-fg/blob/main/testresults/gemeenten_with_geometry.json  
However I cut off most municipalities to have a small filesize.

Modified a timeslider implementation I found here  
https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816

Implemented filtering features by date based on this Openlayers example  
https://openlayers.org/en/latest/examples/filter-points-webgl.html

Implemented a JSON-FG format. It is an override of the GeoJSON format.  
It add functionality for the global coordRefSys attribute and the "time" and "place" feature attributes.  
Implemented a small fix for undefined timestamps. It seems like GDAL generates these values as ".." which is not falsy.

## TODO

Detect start and end date from pasted json

Testbestand genereren met ogr2ogr waarin time wel wordt ingevuld (Remapping van kolomnaam naar time_start en time_end?)
After that check if null is mapped to ".." by ogr2ogr.
-sql "select cast (creationDate as date) as time, \"gml_id\",lokaalID,creationDate,\"LV-publicatiedatum\",tijdstipregistratie,eindRegistratie,bronhouder,relatieveHoogteligging,\"bgt-status\",\"plus-status\",function,\"plus-type\",geometrie2dBak from BAK"
