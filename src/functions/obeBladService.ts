/* global fetch */

interface DocumentAttributes {
  DOCUMENTNAAM: string;
  DOCUMENTNUMMER: string;
  DOCUMENTVERSIE: string;
}

export async function getOBEBladAsync(x: number, y: number): Promise<DocumentAttributes[]> {
  const apiUrl = "https://mapservices.prorail.nl/arcgis/rest/services/Tekeningen_schematisch_002/FeatureServer/0/query";
  const srs = 28992;
  const distance = 1;

  const query = `where=&objectIds=&time=&geometry=${x}%2C${y}` +
    `&geometryType=esriGeometryPoint&inSR=${srs}&spatialRel=esriSpatialRelIntersects` +
    `&distance=${distance}&units=esriSRUnit_Meter&relationParam=&outFields=DOCUMENTNAAM,DOCUMENTNUMMER,DOCUMENTVERSIE` +
    `&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=${srs}` +
    `&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false` +
    `&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=` +
    `&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=` +
    `&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false` +
    `&timeReferenceUnknownClient=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=pjson`;

  const response = await fetch(`${apiUrl}?${query}`);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  // Map the response to return only the DocumentAttributes
  const documentAttributes: DocumentAttributes[] = data.features.map((feature: any) => feature.attributes);

  return documentAttributes;
}
