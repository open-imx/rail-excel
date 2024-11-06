/* global fetch */

import type { Feature, Point, GeoJsonProperties, FeatureCollection, Position } from "geojson";

export interface Kilometering {
  kmLint: string;
  kmValueInMeters: number;
}

interface HectometerProperties extends GeoJsonProperties {
  KM_GEOCODE_T: number;
  KMLINT: string;
}

interface hectometerLine {
  start: Feature<Point, HectometerProperties>;
  end: Feature<Point, HectometerProperties>;
}

export async function getKilometrering(x: number, y: number) {
  const featureCollection = await getHectometerPointsAsync(x, y);
  const features = featureCollection.features as unknown as Feature<Point, HectometerProperties>[];
  const groupedFeatures = features.reduce((acc, feature) => {
    const key = feature.properties.KMLINT;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(feature);
    return acc;
  }, {});

  const result = Object.keys(groupedFeatures).map((key) => {
    return {
      kmValueInMeters: calculateKilometering(groupedFeatures[key], [x, y]),
      kmLint: key,
    } as Kilometering;
  });

  return result.filter((x) => !Number.isNaN(x.kmValueInMeters));
}

const calculateKilometering = (features: Feature<Point, HectometerProperties>[], kmLocation: Position) => {
  const sortedCandidates = features.sort((a, b) => a.properties.KM_GEOCODE_T - b.properties.KM_GEOCODE_T);

  const hectometerLines: hectometerLine[] = [];
  for (let i = 0; i < sortedCandidates.length - 1; i++) {
    hectometerLines.push({
      start: sortedCandidates[i],
      end: sortedCandidates[i + 1],
    });
  }

  const filter = hectometerLines.filter((line) => {
    const factor = getProjectionFactor(kmLocation, line.start.geometry.coordinates, line.end.geometry.coordinates);
    return factor >= 0 && factor <= 1;
  });

  if (filter.length) {
    const line = filter[0];
    const factor = getProjectionFactor(kmLocation, line.start.geometry.coordinates, line.end.geometry.coordinates);
    const projectedPoint = projectPoint(line.start.geometry.coordinates, line.end.geometry.coordinates, factor);
    const distance = getDistance(line.start.geometry.coordinates, projectedPoint);
    return line.start.properties.KM_GEOCODE_T * 1000 + distance;
  }
  return Number.NaN;
};

async function getHectometerPointsAsync(x: number, y: number): Promise<FeatureCollection<Point, HectometerProperties>> {
  const apiUrl = "https://mapservices.prorail.nl/arcgis/rest/services/Referentiesysteem_004/FeatureServer/1/query";
  const distance = 300;
  const srs = 28992;
  const query =
    `where=&objectIds=&time=&geometry=${x}%2C${y}` +
    `&geometryType=esriGeometryPoint&inSR=${srs}&spatialRel=esriSpatialRelIntersects` +
    `&distance=${distance}&units=esriSRUnit_Meter&relationParam=&outFields=KMLINT,KM_GEOCODE_T` +
    `&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=${srs}` +
    `&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false` +
    `&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false` +
    `&orderByFields=&groupByFieldsForStatistics=&outStatistics=` +
    `&returnZ=false&returnM=false&multipatchOption=xyFootprint` +
    `&resultOffset=&resultRecordCount=` +
    `&returnTrueCurves=false&returnExceededLimitFeatures=false` +
    `&quantizationParameters=&returnCentroid=false&timeReferenceUnknownClient=false` +
    `&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson`;

  const response = await fetch(`${apiUrl}?${query}`);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseBody = (await response.json()) as FeatureCollection<Point, HectometerProperties>;
  const features = responseBody.features.map((feature) => {
    return {
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        KM_GEOCODE_T: feature.properties.KM_GEOCODE_T.replace(",", "."),
        KMLINT: feature.properties.KMLINT,
      },
    } as Feature<Point, HectometerProperties>;
  });

  return {
    type: "FeatureCollection",
    features: features,
  } as FeatureCollection<Point, HectometerProperties>;
}

function getDistance(loc1: Position, loc2: Position): number {
  return Math.sqrt((loc2[0] - loc1[0]) ** 2 + (loc2[1] - loc1[1]) ** 2);
}

function getProjectionFactor(point: Position, v: Position, w: Position): number {
  const l2 = getDistance(v, w) ** 2;
  if (l2 === 0) return 0; // Return 0 if v and w are the same point

  const t = ((point[0] - v[0]) * (w[0] - v[0]) + (point[1] - v[1]) * (w[1] - v[1])) / l2;
  return t;
}

function projectPoint(v: Position, w: Position, projectionFactor: number): Position {
  return [v[0] + projectionFactor * (w[0] - v[0]), v[1] + projectionFactor * (w[1] - v[1])];
}
