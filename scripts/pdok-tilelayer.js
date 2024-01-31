// PDOK - BRT background tile layers:
// https://www.pdok.nl/introductie/-/article/basisregistratie-topografie-achtergrondkaarten-brt-a-

import { addRDNewTransformation } from "./openlayers-proj4.js";

// Basisregistratie Topografie (BRT) - Grijs
// URL https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request=GetCapabilities&service=WMTS
// Source tileMatrixSet=EPSG:28992&crs=EPSG:28992&layers=grijs&styles=default&format=image/png&url=https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request%3DGetCapabilities%26service%3DWMTS

// Basisregistratie Topografie (BRT) - Pastel
// URL https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request=GetCapabilities&service=WMTS
// Source tileMatrixSet=EPSG:28992&crs=EPSG:28992&layers=pastel&styles=default&format=image/png&url=https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request%3DGetCapabilities%26service%3DWMTS

export async function addPDOKTileLayer(map) {
  const wmtsServiceURL =
    "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?request=GetCapabilities&service=WMTS";
  const wmtsLayerId = "grijs";

  let projection = ol.proj.get("EPSG:28992");
  if (!projection) {
    addRDNewTransformation();
    projection = ol.proj.get("EPSG:28992");
    if (!projection) {
      console.error(
        "Failed to load PDOK tilelayer. EPSG 28992 transformation could be loaded!"
      );
      return;
    }
  }

  let projectionExtent = projection.getExtent();
  if (!projectionExtent) {
    projectionExtent = [482.06, 306602.42, 284182.97, 637049.52];
    projection.setExtent(projectionExtent);
  }

  const capabilitiesResponse = await fetch(wmtsServiceURL);
  if (capabilitiesResponse.status !== 200) {
    console.error("PDOK WMTS service is not available.");
    console.log(capabilitiesResponse);
    return null;
  }

  const capabilities = await capabilitiesResponse.text();
  const parser = new ol.format.WMTSCapabilities();
  const parsedCapabilities = parser.read(capabilities);

  // console.log("parsedCapabilities:");
  // console.log(parsedCapabilities);
  // console.log("Loading PDOK BRT layer:");
  // console.log(parsedCapabilities.ServiceIdentification.Abstract);

  const wmtsOptions = ol.source.WMTS.optionsFromCapabilities(
    parsedCapabilities,
    {
      layer: wmtsLayerId,
      matrixSet: "EPSG:28992",
    }
  );

  const tileLayer = new ol.layer.Tile({
    source: new ol.source.WMTS(wmtsOptions),
  });

  tileLayer.set("name", "PDOK - BRT " + wmtsLayerId);
  map.addLayer(tileLayer);
  return tileLayer;
}
