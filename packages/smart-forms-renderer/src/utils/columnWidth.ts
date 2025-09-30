/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Calculates the final widths for each column given the column widths and table width.
 * @param columnWidthsSDC Array of column widths from http://hl7.org/fhir/uv/sdc/StructureDefinition-sdc-questionnaire-width.html (string or undefined)
 * @param tableWidth Table width in px
 * @returns Array of calculated column widths (in px or %)
 *
 * @example
 * columnWidthsSDC: [undefined, "400px", undefined]
 * tableWidth: 1200 (Comes from tableContainerRef.current.offsetWidth)
 * output: [
 *   {
 *     "width": "325px",
 *     "isFixed": true
 *   },
 *   {
 *     "width": "550px",
 *     "isFixed": true
 *   },
 *   {
 *     "width": "325px",
 *     "isFixed": true
 *   }
 * ]
 */
export function calculateColumnWidths(
  columnWidthsSDC: (string | undefined)[],
  tableWidth: number
): { width: string; isFixed: boolean }[] {
  // Parse columns into px, %, and unset
  const pxColumns: { idx: number; px: number }[] = [];
  const percentColumns: { idx: number; percent: number }[] = [];
  const unsetColumns: { idx: number }[] = [];

  columnWidthsSDC.forEach((col, idx) => {
    if (col?.endsWith('px')) {
      const px = parseInt(col);
      pxColumns.push({ idx, px });
    } else if (col?.endsWith('%')) {
      const percent = parseFloat(col);
      percentColumns.push({ idx, percent });
    } else {
      unsetColumns.push({ idx });
    }
  });

  // Calculate total px and %
  const totalPx = pxColumns.reduce((sum, c) => sum + c.px, 0);

  // Calculate px for % columns
  const percentPx = percentColumns.map((c) => ({
    ...c,
    px: (c.percent / 100) * tableWidth
  }));
  const totalPercentPx = percentPx.reduce((sum, c) => sum + c.px, 0);

  // Remaining px for unset columns
  let remainingPx = tableWidth - totalPx - totalPercentPx;
  if (remainingPx < 0) remainingPx = 0; // overflow, will be handled by scroll

  // Distribute remaining px equally to unset columns
  const unsetPx = unsetColumns.length > 0 ? remainingPx / unsetColumns.length : 0;

  // Build result array
  return columnWidthsSDC.map((col, idx) => {
    // px columns
    const pxCol = pxColumns.find((c) => c.idx === idx);
    if (pxCol) {
      return {
        width: `${pxCol.px}px`,
        isFixed: true
      };
    }
    // % columns
    const percentCol = percentColumns.find((c) => c.idx === idx);
    if (percentCol) {
      return {
        width: `${percentCol.percent}%`,
        isFixed: false
      };
    }
    // unset columns
    const unsetCol = unsetColumns.find((c) => c.idx === idx);
    if (unsetCol) {
      return {
        width: `${unsetPx}px`,
        isFixed: true
      };
    }

    // fallback
    return { width: 'auto', isFixed: false };
  });
}
