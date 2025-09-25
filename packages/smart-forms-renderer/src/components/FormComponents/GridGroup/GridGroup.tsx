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
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import useHidden from '../../../hooks/useHidden';
import { QGroupContainerBox } from '../../Box.styles';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { mapQItemsIndex } from '../../../utils/mapItem';
import GridTable from './GridTable';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore, useRendererStylingStore } from '../../../stores';
import GroupHeading from '../GroupItem/GroupHeading';
import type { ItemPath } from '../../../interfaces/itemPath.interface';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { getItemTextToDisplay } from '../../../utils/itemTextToDisplay';
import { isItemHidden } from '../../../utils/qItem';
import { useResizeColumns } from '../../../hooks/useResizeColumns';
import { getColumnWidth } from '../../../utils/extensions';
import { calculateColumnWidths } from '../../../utils/columnWidth';

interface GridGroupProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

/**
 * Main component to render a Group Grid (grid) Questionnaire item.
 * @see {@link https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html}
 *
 * @author Sean Fong
 */
function GridGroup(props: GridGroupProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    groupCardElevation,
    parentIsReadOnly,
    parentStyles,
    onQrItemChange
  } = props;

  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();
  const enableWhenAsReadOnly = useRendererStylingStore.use.enableWhenAsReadOnly();

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const qRowItems = qItem.item;
  const qrGroup = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const qrRowItems = qrGroup.item;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  // Prepare visible first-row items. we use useMemo because we are using it inside useMemo later.
  const firstRowItems: QuestionnaireItem[] = useMemo(() => qRowItems?.[0]?.item ?? [], [qRowItems]);

  // Get the items and ignore hidden columns as they are automatically added to the columnHeaders as empty space.
  const visibleColumnItems: QuestionnaireItem[] = useMemo(
    () =>
      firstRowItems?.filter(
        (item) =>
          !isItemHidden(
            item,
            enableWhenIsActivated,
            enableWhenItems,
            enableWhenExpressions,
            enableWhenAsReadOnly
          )
      ),
    [
      enableWhenAsReadOnly,
      enableWhenExpressions,
      enableWhenIsActivated,
      enableWhenItems,
      firstRowItems
    ]
  );

  // Get column headers from first row item.text
  const columnHeaders: {
    label: string;
    styleString: string | null;
  }[] = useMemo(
    () =>
      visibleColumnItems.map((firstItem) => ({
        label: getItemTextToDisplay(firstItem) ?? ' ',
        styleString: structuredDataCapture.getStyle(firstItem._text) ?? null
      })) ?? [],
    [visibleColumnItems]
  );

  // Table width ref and state
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  useResizeColumns(tableContainerRef, setTableWidth);

  // Build and calculate column widths
  // Add an initial 20% width for the row header column temporarily, will be removed after calculation
  const columnWidths = useMemo(
    () => ['20%', ...visibleColumnItems.map((item) => getColumnWidth(item))],
    [visibleColumnItems]
  );

  const calculatedColumnWidths = useMemo(() => {
    const calculatedColumnWidthsInclLabel = calculateColumnWidths(columnWidths, tableWidth);

    // Remove the first column width of 20% as it is for the row header
    return calculatedColumnWidthsInclLabel.slice(1);
  }, [columnWidths, tableWidth]);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  if (!qRowItems || !qrRowItems) {
    return <>Unable to load group, something has gone terribly wrong.</>;
  }

  // Check if there are row within the grid
  if (qRowItems.length === 0) {
    return null;
  }

  // Event Handlers
  function handleRowChange(newQrItem: QuestionnaireResponseItem, targetItemPath?: ItemPath) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrItemsInGroup(newQrItem, null, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup, targetItemPath);
  }

  // Get item.text as display label
  const itemTextToDisplay = getItemTextToDisplay(qItem);

  return (
    <QGroupContainerBox
      cardElevation={groupCardElevation}
      isRepeated={false}
      py={3}
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}
      style={parentStyles || undefined}>
      {itemTextToDisplay ? (
        <>
          <GroupHeading qItem={qItem} readOnly={readOnly} groupCardElevation={groupCardElevation} />
          <Divider sx={{ my: 1, opacity: 0.6 }} />
        </>
      ) : null}

      <div ref={tableContainerRef} style={{ width: '100%' }}>
        <TableContainer component={Paper} elevation={groupCardElevation}>
          <GridTable
            qItems={qRowItems}
            qrItems={qrRowItems}
            qItemsIndexMap={qItemsIndexMap}
            columnHeaders={columnHeaders}
            calculatedColumnWidths={calculatedColumnWidths}
            itemPath={itemPath}
            parentIsReadOnly={readOnly}
            parentStyles={parentStyles}
            onQrItemChange={handleRowChange}
          />
        </TableContainer>
      </div>
    </QGroupContainerBox>
  );
}

export default GridGroup;
