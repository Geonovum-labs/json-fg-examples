export function addOSMTileLayer(map) {
  const layer = new ol.layer.Tile({
    source: new ol.source.OSM(),
  });
  layer.set("name", "OpenStreetMap");

  map.addLayer(layer);
  return layer;
}
