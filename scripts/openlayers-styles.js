export function getPointStyle(
  borderColor = "red",
  fillColor = "rgba(255, 0, 0, 0.1)"
) {
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: fillColor,
      stroke: new ol.style.Stroke({ color: borderColor, width: 1 }),
    }),
  });
}

export function getLineStyle(borderColor = "red") {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: borderColor,
      width: 2,
    }),
  });
}

export function getPolygonStyle(
  borderColor = "red",
  fillColor = "rgba(255, 0, 0, 0.1)"
) {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: borderColor,
      // lineDash: [4],
      width: 2,
    }),
    fill: new ol.style.Fill({
      color: fillColor,
    }),
  });
}

export function getCollectionStyle(
  borderColor = "red",
  fillColor = "rgba(255, 0, 0, 0.1)"
) {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: borderColor,
      // lineDash: [4],
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: fillColor,
    }),
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: fillColor,
      }),
      stroke: new ol.style.Stroke({ color: borderColor, width: 1 }),
    }),
  });
}

export const blueStyles = {
  Point: getPointStyle("blue", "rgba(0, 0, 255, 0.1)"),
  LineString: getLineStyle("blue"),
  MultiLineString: getLineStyle("blue"),
  MultiPoint: getPointStyle("blue", "rgba(0, 0, 255, 0.1)"),
  MultiPolygon: getPolygonStyle("blue", "rgba(0, 0, 255, 0.1)"),
  Polygon: getPolygonStyle("blue", "rgba(0, 0, 255, 0.1)"),
  GeometryCollection: getCollectionStyle("blue", "rgba(0, 0, 255, 0.1)"),
  Circle: getPolygonStyle("blue", "rgba(0, 0, 255, 0.1)"),
};

export const redStyles = {
  Point: getPointStyle("red", "rgba(255, 0, 0, 0.1)"),
  LineString: getLineStyle("red"),
  MultiLineString: getLineStyle("red"),
  MultiPoint: getPointStyle("red", "rgba(255, 0, 0, 0.1)"),
  MultiPolygon: getPolygonStyle("red", "rgba(255, 0, 0, 0.1)"),
  Polygon: getPolygonStyle("red", "rgba(255, 0, 0, 0.1)"),
  GeometryCollection: getCollectionStyle("red", "rgba(255, 0, 0, 0.1)"),
  Circle: getPolygonStyle("red", "rgba(255, 0, 0, 0.1)"),
};
