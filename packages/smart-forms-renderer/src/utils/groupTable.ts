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

import type { GroupTableRowModel } from '../interfaces/groupTable.interface';

export function reorderRows(
  rows: GroupTableRowModel[],
  sourceIndex: number,
  destinationIndex: number
) {
  // Handle empty array case
  if (rows.length === 0) {
    return [];
  }

  const result = Array.from(rows);
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);

  return result;
}

export function getGroupTableItemsToUpdate(tableRows: GroupTableRowModel[], selectedIds: string[]) {
  return tableRows
    .filter((row) => selectedIds.includes(row.id))
    .flatMap((singleRow) => (singleRow.qrItem ? [structuredClone(singleRow.qrItem)] : []));
}

/**
 * Get the index of a rendered gtable row within the QuestionnaireResponse, or null if the row has no
 * QuestionnaireResponse counterpart.
 *
 * Rows that are unselected or still empty are dropped by {@link getGroupTableItemsToUpdate}, so a
 * row's rendered index is not its index in the QuestionnaireResponse. Validation walks the
 * QuestionnaireResponse, so instance-scoped error keys must use this index instead.
 *
 * Keep the filter here in sync with {@link getGroupTableItemsToUpdate}.
 *
 * @author Clinton Gillespie
 */
export function getQrGroupTableRowIndex(
  tableRows: GroupTableRowModel[],
  selectedIds: string[],
  rowIndex: number
): number | null {
  const row = tableRows[rowIndex];
  if (!row || !row.qrItem || !selectedIds.includes(row.id)) {
    return null;
  }

  return tableRows
    .slice(0, rowIndex)
    .filter((precedingRow) => selectedIds.includes(precedingRow.id) && precedingRow.qrItem).length;
}
