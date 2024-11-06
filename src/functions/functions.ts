/* global clearInterval, console, CustomFunctions, setInterval */

import { getKilometrering } from "./kilometreringService";
import { getOBEBladAsync } from "./obeBladService";
import WktParser from "terraformer-wkt-parser";

/**
 * Get the X coordinate from a WKT string.
 * If the WKT represents a point, line, or polygon, return the X coordinate of the first point.
 * @customfunction
 * @param wktString WKT string
 * @returns X coordinate of the first point or an error message if the WKT is invalid.
 */
export function wkt_x(wktString: string) {
  try {
    const result = WktParser.parse(wktString);

    if (result.type === "Point") {
      const [x] = result.coordinates;
      return x;
    } else if (result.type === "LineString" || result.type === "MultiPoint") {
      const [x] = result.coordinates[0];
      return x;
    } else if (result.type === "Polygon") {
      const [x] = result.coordinates[0][0];
      return x;
    } else {
      return "Error: Unsupported WKT geometry type";
    }
  } catch (error: any) {
    return `Error: ${error?.message || "An unknown error occurred"}`;
  }
}

/**
 * Get the Y coordinate from a WKT string.
 * If the WKT represents a point, line, or polygon, return the Y coordinate of the first point.
 * @customfunction
 * @param wktString WKT string
 * @returns Y coordinate of the first point or an error message if the WKT is invalid.
 */
export function wkt_y(wktString: string) {
  try {
    const result = WktParser.parse(wktString);

    if (result.type === "Point") {
      const [, y] = result.coordinates;
      return y;
    } else if (result.type === "LineString" || result.type === "MultiPoint") {
      const [, y] = result.coordinates[0];
      return y;
    } else if (result.type === "Polygon") {
      const [, y] = result.coordinates[0][0];
      return y;
    } else {
      return "Error: Unsupported WKT geometry type";
    }
  } catch (error: any) {
    return `Error: ${error?.message || "An unknown error occurred"}`;
  }
}

/**
 * Get the document name from x and y coordinates.
 * @customfunction
 * @param x x coordinate
 * @param y y coordinate
 * @returns Document name(s) as a comma-separated string
 */
export async function obe_naam(x: number, y: number): Promise<string> {
  try {
    const documents = await getOBEBladAsync(x, y);
    return documents.map((doc) => doc.DOCUMENTNAAM).join(", ");
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Get the document number from x and y coordinates.
 * @customfunction
 * @param x x coordinate
 * @param y y coordinate
 * @returns Document number(s) as a comma-separated string
 */
export async function obe_nummer(x: number, y: number): Promise<string> {
  try {
    const documents = await getOBEBladAsync(x, y);
    return documents.map((doc) => doc.DOCUMENTNUMMER).join(", ");
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Get the document version from x and y coordinates.
 * @customfunction
 * @param x x coordinate
 * @param y y coordinate
 * @returns Document version(s) as a comma-separated string
 */
export async function obe_versie(x: number, y: number): Promise<string> {
  try {
    const documents = await getOBEBladAsync(x, y);
    return documents.map((doc) => doc.DOCUMENTVERSIE).join(", ");
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Get the kilometerlint from x and y coordinates.
 * @customfunction
 * @param x x coordinate
 * @param y y coordinate
 * @returns kilometervalue
 */
export async function km_linten(x, y) {
  try {
    const result = await getKilometrering(x, y);
    return result.map((x) => x.kmLint).join(", ");
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Calculates the kilometer value from x and y coordinates.
 * @customfunction
 * @param x x coordinate
 * @param y y coordinate
 * @param lint y coordinate
 * @returns kilometervalue
 */
export async function km(x, y, lint) {
  try {
    const result = await getKilometrering(x, y);
    return result.find((x) => x.kmLint === lint)?.kmValueInMeters;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// /**
//  * Displays the current time once a second.
//  * @customfunction
//  * @param invocation Custom function handler
//  */
// export function clock(invocation: CustomFunctions.StreamingInvocation<string>): void {
//   const timer = setInterval(() => {
//     const time = currentTime();
//     invocation.setResult(time);
//   }, 1000);

//   invocation.onCanceled = () => {
//     clearInterval(timer);
//   };
// }

// /**
//  * Returns the current time.
//  * @returns String with the current time formatted for the current locale.
//  */
// export function currentTime(): string {
//   return new Date().toLocaleTimeString();
// }

// /**
//  * Increments a value once a second.
//  * @customfunction
//  * @param incrementBy Amount to increment
//  * @param invocation Custom function handler
//  */
// export function increment(incrementBy: number, invocation: CustomFunctions.StreamingInvocation<number>): void {
//   let result = 0;
//   const timer = setInterval(() => {
//     result += incrementBy;
//     invocation.setResult(result);
//   }, 1000);

//   invocation.onCanceled = () => {
//     clearInterval(timer);
//   };
// }

// /**
//  * Writes a message to console.log().
//  * @customfunction LOG
//  * @param message String to write.
//  * @returns String to write.
//  */
// export function logMessage(message: string): string {
//   console.log(message);

//   return message;
// }
