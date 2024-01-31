// Needed certain internal functions from ol/format/GeoJSON.js
// Just copied them over as exported functions:

/**
 * @param {GeoJSONGeometry|GeoJSONGeometryCollection} object Object.
 * @param {import("./Feature.js").ReadOptions} [options] Read options.
 * @return {import("./Feature.js").GeometryObject} Geometry.
 */
export function readGeometryInternal(object, options) {
  if (!object) {
    return null;
  }

  /** @type {import("./Feature.js").GeometryObject} */
  let geometry;
  switch (object["type"]) {
    case "Point": {
      geometry = readPointGeometry(/** @type {GeoJSONPoint} */ (object));
      break;
    }
    case "LineString": {
      geometry = readLineStringGeometry(
        /** @type {GeoJSONLineString} */ (object)
      );
      break;
    }
    case "Polygon": {
      geometry = readPolygonGeometry(/** @type {GeoJSONPolygon} */ (object));
      break;
    }
    case "MultiPoint": {
      geometry = readMultiPointGeometry(
        /** @type {GeoJSONMultiPoint} */ (object)
      );
      break;
    }
    case "MultiLineString": {
      geometry = readMultiLineStringGeometry(
        /** @type {GeoJSONMultiLineString} */ (object)
      );
      break;
    }
    case "MultiPolygon": {
      geometry = readMultiPolygonGeometry(
        /** @type {GeoJSONMultiPolygon} */ (object)
      );
      break;
    }
    case "GeometryCollection": {
      geometry = readGeometryCollectionGeometry(
        /** @type {GeoJSONGeometryCollection} */ (object)
      );
      break;
    }
    default: {
      throw new Error("Unsupported GeoJSON type: " + object["type"]);
    }
  }
  return geometry;
}

/**
 * @param {GeoJSONGeometry|GeoJSONGeometryCollection} object Object.
 * @param {import("./Feature.js").ReadOptions} [options] Read options.
 * @return {import("../geom/Geometry.js").default} Geometry.
 */
function readGeometry(object, options) {
  const geometryObject = readGeometryInternal(object, options);
  return createGeometry(geometryObject, options);
}

/**
 * @param {GeoJSONGeometryCollection} object Object.
 * @param {import("./Feature.js").ReadOptions} [options] Read options.
 * @return {import("./Feature.js").GeometryCollectionObject} Geometry collection.
 */
function readGeometryCollectionGeometry(object, options) {
  const geometries = object["geometries"].map(
    /**
     * @param {GeoJSONGeometry} geometry Geometry.
     * @return {import("./Feature.js").GeometryObject} geometry Geometry.
     */
    function (geometry) {
      return readGeometryInternal(geometry, options);
    }
  );
  return geometries;
}

/**
 * @param {GeoJSONPoint} object Input object.
 * @return {import("./Feature.js").GeometryObject} Point geometry.
 */
function readPointGeometry(object) {
  const flatCoordinates = object["coordinates"];
  return {
    type: "Point",
    flatCoordinates,
    layout: ol.geom.SimpleGeometry.getLayoutForStride(flatCoordinates.length),
  };
}

/**
 * @param {GeoJSONLineString} object Object.
 * @return {import("./Feature.js").GeometryObject} LineString geometry.
 */
function readLineStringGeometry(object) {
  const coordinates = object["coordinates"];
  const flatCoordinates = coordinates.flat();
  return {
    type: "LineString",
    flatCoordinates,
    ends: [flatCoordinates.length],
    layout: ol.geom.SimpleGeometry.getLayoutForStride(
      coordinates[0]?.length || 2
    ),
  };
}

/**
 * @param {GeoJSONMultiLineString} object Object.
 * @return {import("./Feature.js").GeometryObject} MultiLineString geometry.
 */
function readMultiLineStringGeometry(object) {
  const coordinates = object["coordinates"];
  const stride = coordinates[0]?.[0]?.length || 2;
  const flatCoordinates = [];
  const ends = ol.geom.flat.deflate.deflateCoordinatesArray(
    flatCoordinates,
    0,
    coordinates,
    stride
  );
  return {
    type: "MultiLineString",
    flatCoordinates,
    ends,
    layout: ol.geom.SimpleGeometry.getLayoutForStride(stride),
  };
}

/**
 * @param {GeoJSONMultiPoint} object Object.
 * @return {import("./Feature.js").GeometryObject} MultiPoint geometry.
 */
function readMultiPointGeometry(object) {
  const coordinates = object["coordinates"];
  return {
    type: "MultiPoint",
    flatCoordinates: coordinates.flat(),
    layout: ol.geom.SimpleGeometry.getLayoutForStride(
      coordinates[0]?.length || 2
    ),
  };
}

/**
 * @param {GeoJSONMultiPolygon} object Object.
 * @return {import("./Feature.js").GeometryObject} MultiPolygon geometry.
 */
function readMultiPolygonGeometry(object) {
  const coordinates = object["coordinates"];
  const flatCoordinates = [];
  const stride = coordinates[0]?.[0]?.[0].length || 2;
  const endss = ol.geom.flat.deflate.deflateMultiCoordinatesArray(
    flatCoordinates,
    0,
    coordinates,
    stride
  );
  return {
    type: "MultiPolygon",
    flatCoordinates,
    ends: endss,
    layout: ol.geom.SimpleGeometry.getLayoutForStride(stride),
  };
}

/**
 * @param {GeoJSONPolygon} object Object.
 * @return {import("./Feature.js").GeometryObject} Polygon.
 */
function readPolygonGeometry(object) {
  const coordinates = object["coordinates"];
  const flatCoordinates = [];
  const stride = coordinates[0]?.[0]?.length;
  const ends = ol.geom.flat.deflate.deflateCoordinatesArray(
    flatCoordinates,
    0,
    coordinates,
    stride
  );
  return {
    type: "Polygon",
    flatCoordinates,
    ends,
    layout: ol.geom.SimpleGeometry.getLayoutForStride(stride),
  };
}

/**
 * @param {import("../geom/Geometry.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeGeometry(geometry, options) {
  geometry = transformGeometryWithOptions(geometry, true, options);

  const type = geometry.getType();

  /** @type {GeoJSONGeometry} */
  let geoJSON;
  switch (type) {
    case "Point": {
      geoJSON = writePointGeometry(
        /** @type {import("../geom/Point.js").default} */ (geometry),
        options
      );
      break;
    }
    case "LineString": {
      geoJSON = writeLineStringGeometry(
        /** @type {import("../geom/LineString.js").default} */ (geometry),
        options
      );
      break;
    }
    case "Polygon": {
      geoJSON = writePolygonGeometry(
        /** @type {import("../geom/Polygon.js").default} */ (geometry),
        options
      );
      break;
    }
    case "MultiPoint": {
      geoJSON = writeMultiPointGeometry(
        /** @type {import("../geom/MultiPoint.js").default} */ (geometry),
        options
      );
      break;
    }
    case "MultiLineString": {
      geoJSON = writeMultiLineStringGeometry(
        /** @type {import("../geom/MultiLineString.js").default} */ (geometry),
        options
      );
      break;
    }
    case "MultiPolygon": {
      geoJSON = writeMultiPolygonGeometry(
        /** @type {import("../geom/MultiPolygon.js").default} */ (geometry),
        options
      );
      break;
    }
    case "GeometryCollection": {
      geoJSON = writeGeometryCollectionGeometry(
        /** @type {import("../geom/GeometryCollection.js").default} */ (
          geometry
        ),
        options
      );
      break;
    }
    case "Circle": {
      geoJSON = {
        type: "GeometryCollection",
        geometries: [],
      };
      break;
    }
    default: {
      throw new Error("Unsupported geometry type: " + type);
    }
  }
  return geoJSON;
}

/**
 * @param {import("../geom/GeometryCollection.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometryCollection} GeoJSON geometry collection.
 */
function writeGeometryCollectionGeometry(geometry, options) {
  options = Object.assign({}, options);
  delete options.featureProjection;
  const geometries = geometry.getGeometriesArray().map(function (geometry) {
    return writeGeometry(geometry, options);
  });
  return {
    type: "GeometryCollection",
    geometries: geometries,
  };
}

/**
 * @param {import("../geom/LineString.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeLineStringGeometry(geometry, options) {
  return {
    type: "LineString",
    coordinates: geometry.getCoordinates(),
  };
}

/**
 * @param {import("../geom/MultiLineString.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeMultiLineStringGeometry(geometry, options) {
  return {
    type: "MultiLineString",
    coordinates: geometry.getCoordinates(),
  };
}

/**
 * @param {import("../geom/MultiPoint.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeMultiPointGeometry(geometry, options) {
  return {
    type: "MultiPoint",
    coordinates: geometry.getCoordinates(),
  };
}

/**
 * @param {import("../geom/MultiPolygon.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeMultiPolygonGeometry(geometry, options) {
  let right;
  if (options) {
    right = options.rightHanded;
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.getCoordinates(right),
  };
}

/**
 * @param {import("../geom/Point.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writePointGeometry(geometry, options) {
  return {
    type: "Point",
    coordinates: geometry.getCoordinates(),
  };
}

/**
 * @param {import("../geom/Polygon.js").default} geometry Geometry.
 * @param {import("./Feature.js").WriteOptions} [options] Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writePolygonGeometry(geometry, options) {
  let right;
  if (options) {
    right = options.rightHanded;
  }
  return {
    type: "Polygon",
    coordinates: geometry.getCoordinates(right),
  };
}
