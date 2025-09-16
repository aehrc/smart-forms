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

import React, { useMemo, useRef, useState } from 'react';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { mapQItemsIndex } from '../../../utils/mapItem';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrRepeatGroupChangeHandler
} from '../../../interfaces/renderProps.interface';
import useReadOnly from '../../../hooks/useReadOnly';
import GroupTableView from './GroupTableView';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import { getGroupTableItemsToUpdate } from '../../../utils/groupTable';
import useGroupTableRows from '../../../hooks/useGroupTableRows';
import { flushSync } from 'react-dom';
import { generateNewRepeatId } from '../../../utils/repeatId';
import useInitialiseGroupTableRows from '../../../hooks/useInitialiseGroupTableRows';
import type { ItemPath } from '../../../interfaces/itemPath.interface';
import { isItemHidden } from '../../../utils/qItem';
import { useQuestionnaireStore, useRendererStylingStore } from '../../../stores';
import { getColumnWidth } from '../../../utils/extensions';
import { calculateColumnWidths } from '../../../utils/columnWidth';
import { useResizeColumns } from '../../../hooks/useResizeColumns';

interface GroupTableProps
  extends PropsWithQrRepeatGroupChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
  parentStyles?: Record<string, string>;
}

/**
 * Main component to render a Group Table (gtable) Questionnaire item.
 * @see {@link https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html}
 *
 * @author Sean Fong
 */
function GroupTable(props: GroupTableProps) {
  const {
    qItem,
    qrItems,
    itemPath,
    groupCardElevation,
    isRepeated,
    parentIsReadOnly,
    parentStyles,
    onQrRepeatGroupChange
  } = props;

  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();
  const enableWhenAsReadOnly = useRendererStylingStore.use.enableWhenAsReadOnly();

  const initialGroupTableRows = useInitialiseGroupTableRows(qItem.linkId, qrItems);
  const { tableRows, selectedIds, setTableRows, setSelectedIds } =
    useGroupTableRows(initialGroupTableRows);

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  // Generate item labels as table headers
  const qItems = qItem.item;
  const visibleItemLabels: string[] = useMemo(
    () =>
      qItems
        ?.filter(
          (item) =>
            !isItemHidden(
              item,
              enableWhenIsActivated,
              enableWhenItems,
              enableWhenExpressions,
              enableWhenAsReadOnly
            )
        )
        .map((item) => item.text ?? '') ?? [],
    [enableWhenAsReadOnly, enableWhenExpressions, enableWhenIsActivated, enableWhenItems, qItems]
  );

  // Get visible label items
  const visibleLabelItems = useMemo(
    () =>
      qItems?.filter(
        (item) =>
          !isItemHidden(
            item,
            enableWhenIsActivated,
            enableWhenItems,
            enableWhenExpressions,
            enableWhenAsReadOnly
          )
      ) ?? [],
    [enableWhenAsReadOnly, enableWhenExpressions, enableWhenIsActivated, enableWhenItems, qItems]
  );

  // Table width ref and state
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  useResizeColumns(tableContainerRef, setTableWidth);

  // Build and calculate column widths
  const columnWidths = useMemo(
    () => visibleLabelItems.map((item) => getColumnWidth(item)),
    [visibleLabelItems]
  );

  const calculatedColumnWidths = useMemo(
    () => calculateColumnWidths(columnWidths, tableWidth),
    [columnWidths, tableWidth]
  );

  // Determine if the group table is readOnly
  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Check if there are columns within the group table
  if (!qItems || qItems.length === 0) {
    return null;
  }

  // Event Handlers
  function handleRowChange(
    newQrRow: QuestionnaireResponseItem,
    index: number,
    targetItemPath?: ItemPath
  ) {
    const updatedTableRows = [...tableRows];

    if (newQrRow.item) {
      updatedTableRows[index].qrItem = {
        linkId: newQrRow.linkId,
        text: newQrRow.text,
        item: newQrRow.item
      };
    }

    setTableRows(updatedTableRows);

    // Include targetItemPath because an answer is changed
    onQrRepeatGroupChange(
      {
        linkId: qItem.linkId,
        qrItems: getGroupTableItemsToUpdate(updatedTableRows, selectedIds)
      },
      targetItemPath
    );
  }

  function handleRemoveRow(index: number) {
    const updatedTableRows = [...tableRows];

    const rowToRemove = updatedTableRows[index];
    const updatedSelectedIds = selectedIds.filter((id) => id !== rowToRemove.id);

    updatedTableRows.splice(index, 1);

    setTableRows(updatedTableRows);

    // Don't need to include targetItemPath, only include targetItemPath if an answer is changed
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(updatedTableRows, updatedSelectedIds)
    });
    setSelectedIds(updatedSelectedIds);
  }

  function handleAddRow() {
    const newRowId = generateNewRepeatId(qItem.linkId);
    setTableRows([
      ...tableRows,
      {
        id: newRowId,
        qrItem: null
      }
    ]);
    setSelectedIds([...selectedIds, newRowId]);
  }

  function handleSelectAll() {
    // unselect all if all are selected, otherwise select all
    const updatedTableIds =
      selectedIds.length === tableRows.length ? [] : tableRows.map((tableRow) => tableRow.id);
    setSelectedIds(updatedTableIds);

    // Don't need to include targetItemPath, only include targetItemPath if an answer is changed
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(tableRows, updatedTableIds)
    });
  }

  function handleSelectRow(rowId: string) {
    const updatedSelectedIds = [...selectedIds];

    const index = updatedSelectedIds.indexOf(rowId);
    if (index === -1) {
      updatedSelectedIds.push(rowId);
    } else {
      updatedSelectedIds.splice(index, 1);
    }

    setSelectedIds(updatedSelectedIds);

    // Don't need to include targetItemPath, only include targetItemPath if an answer is changed
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(tableRows, updatedSelectedIds)
    });
  }

  async function handleReorderRows(newTableRows: GroupTableRowModel[]) {
    // Prevent state batching when reordering to prevent view stuttering https://react.dev/reference/react-dom/flushSync
    flushSync(() => {
      setTableRows(newTableRows);
    });

    // Don't need to include targetItemPath, only include targetItemPath if an answer is changed
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(newTableRows, selectedIds)
    });
  }

  return (
    <div ref={tableContainerRef} style={{ width: '100%' }}>
      <GroupTableView
        qItem={qItem}
        qItemsIndexMap={qItemsIndexMap}
        itemPath={itemPath}
        groupCardElevation={groupCardElevation}
        isRepeated={isRepeated}
        readOnly={readOnly}
        tableRows={tableRows}
        selectedIds={selectedIds}
        visibleItemLabels={visibleItemLabels}
        calculatedColumnWidths={calculatedColumnWidths}
        parentIsReadOnly={parentIsReadOnly}
        parentStyles={parentStyles}
        onAddRow={handleAddRow}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onReorderRows={handleReorderRows}
      />
    </div>
  );
}

export default GroupTable;
