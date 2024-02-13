// PDOK - BRT background tile layers:
// https://www.pdok.nl/introductie/-/article/basisregistratie-topografie-achtergrondkaarten-brt-a-

import { addOpenLayersTransformation } from "./openlayers-proj4.js";

// Basisregistratie Topografie (BRT) - Grijs
// URL https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request=GetCapabilities&service=WMTS
// Source tileMatrixSet=EPSG:28992&crs=EPSG:28992&layers=grijs&styles=default&format=image/png&url=https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request%3DGetCapabilities%26service%3DWMTS

// Basisregistratie Topografie (BRT) - Pastel
// URL https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request=GetCapabilities&service=WMTS
// Source tileMatrixSet=EPSG:28992&crs=EPSG:28992&layers=pastel&styles=default&format=image/png&url=https://service.pdok.nl//brt/achtergrondkaart/wmts/v2_0?request%3DGetCapabilities%26service%3DWMTS

export function addOSMBaseLayer(map) {
  const tileLayer = new ol.layer.Tile({
    title: "OSM",
    type: "base",
    source: new ol.source.OSM(),
  });

  map.addLayer(tileLayer);
  return tileLayer;
}

export async function addPDOKTileLayer(map, wmtsLayerId) {
  const wmtsServiceURL =
    "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?request=GetCapabilities&service=WMTS";

  // Define the transformation of the Dutch EPSG:28992 system.
  // Source: https://epsg.io/28992
  // IIRC you can make this Dutch RD New system more precise (like 10 meters) by loading a grid of deviations from this approximation.
  let projection = ol.proj.get("EPSG:28992");
  if (!projection) {
    addOpenLayersTransformation(
      "EPSG:28992",
      "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs"
    );
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
  // Title and base are used by the LayerSwitcher control
  tileLayer.set("title", "PDOK - BRT " + wmtsLayerId);
  tileLayer.set("type", "base");
  map.addLayer(tileLayer);
  return tileLayer;
}
