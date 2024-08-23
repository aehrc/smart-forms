/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import React, { useMemo } from 'react';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { mapQItemsIndex } from '../../../utils/mapItem';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrRepeatGroupChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import { nanoid } from 'nanoid';
import useReadOnly from '../../../hooks/useReadOnly';
import GroupTableView from './GroupTableView';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import { getGroupTableItemsToUpdate } from '../../../utils/groupTable';
import useGroupTableRows from '../../../hooks/useGroupTableRows';
import { flushSync } from 'react-dom';

interface GroupTableProps
  extends PropsWithQrRepeatGroupChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
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
    groupCardElevation,
    isRepeated,
    showMinimalView,
    parentIsReadOnly,
    onQrRepeatGroupChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const { tableRows, selectedIds, setTableRows, setSelectedIds } = useGroupTableRows(qrItems);

  // Generate item labels as table headers
  const qItems = qItem.item;
  const itemLabels: string[] = useMemo(
    () => qItems?.map((item) => item.text ?? '') ?? [],
    [qItems]
  );

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  // Check if there are columns within the group table
  if (!qItems || qItems.length === 0) {
    return null;
  }

  // Event Handlers
  function handleRowChange(newQrRow: QuestionnaireResponseItem, index: number) {
    const updatedTableRows = [...tableRows];

    if (newQrRow.item) {
      updatedTableRows[index].qrItem = {
        linkId: newQrRow.linkId,
        text: newQrRow.text,
        item: newQrRow.item
      };
    }

    setTableRows(updatedTableRows);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(updatedTableRows, selectedIds)
    });
  }

  function handleRemoveRow(index: number) {
    const updatedTableRows = [...tableRows];

    const rowToRemove = updatedTableRows[index];
    const updatedSelectedIds = selectedIds.filter((id) => id !== rowToRemove.nanoId);

    updatedTableRows.splice(index, 1);

    setTableRows(updatedTableRows);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(updatedTableRows, updatedSelectedIds)
    });
    setSelectedIds(updatedSelectedIds);
  }

  function handleAddRow() {
    const newRowNanoId = nanoid();
    setTableRows([
      ...tableRows,
      {
        nanoId: newRowNanoId,
        qrItem: null
      }
    ]);
    setSelectedIds([...selectedIds, newRowNanoId]);
  }

  function handleSelectAll() {
    // deselect all if all are selected, otherwise select all
    const updatedTableIds =
      selectedIds.length === tableRows.length ? [] : tableRows.map((tableRow) => tableRow.nanoId);
    setSelectedIds(updatedTableIds);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(tableRows, updatedTableIds)
    });
  }

  function handleSelectRow(nanoId: string) {
    const updatedSelectedIds = [...selectedIds];

    const index = updatedSelectedIds.indexOf(nanoId);
    if (index === -1) {
      updatedSelectedIds.push(nanoId);
    } else {
      updatedSelectedIds.splice(index, 1);
    }

    setSelectedIds(updatedSelectedIds);
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
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: getGroupTableItemsToUpdate(newTableRows, selectedIds)
    });
  }

  return (
    <GroupTableView
      qItem={qItem}
      qItemsIndexMap={qItemsIndexMap}
      groupCardElevation={groupCardElevation}
      isRepeated={isRepeated}
      readOnly={readOnly}
      tableRows={tableRows}
      selectedIds={selectedIds}
      itemLabels={itemLabels}
      showMinimalView={showMinimalView}
      parentIsReadOnly={parentIsReadOnly}
      onAddRow={handleAddRow}
      onRowChange={handleRowChange}
      onRemoveRow={handleRemoveRow}
      onSelectRow={handleSelectRow}
      onSelectAll={handleSelectAll}
      onReorderRows={handleReorderRows}
    />
  );
}

export default GroupTable;
