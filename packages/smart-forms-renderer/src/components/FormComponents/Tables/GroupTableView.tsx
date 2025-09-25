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

import React from 'react';
import { QGroupContainerBox } from '../../Box.styles';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { HeaderTableCell } from './Table.styles';
import TableCell from '@mui/material/TableCell';
import Divider from '@mui/material/Divider';
import AddRowButton from './AddRowButton';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute
} from '../../../interfaces/renderProps.interface';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import GroupTableBody from './GroupTableBody';
import { useQuestionnaireStore, useRendererStylingStore } from '../../../stores';
import { getGroupCollapsible } from '../../../utils/qItem';
import { GroupAccordion } from '../GroupItem/GroupAccordion.styles';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import GroupHeading from '../GroupItem/GroupHeading';
import { StandardCheckbox } from '../../Checkbox.styles';
import type { ItemPath } from '../../../interfaces/itemPath.interface';
import { Box } from '@mui/material';
import { getItemTextToDisplay } from '../../../utils/itemTextToDisplay';
import { isGroupAddItemButtonHidden } from '../../../utils/extensions';

interface GroupTableViewProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qItemsIndexMap: Record<string, number>;
  groupCardElevation: number;
  readOnly: boolean;
  tableRows: GroupTableRowModel[];
  selectedIds: string[];
  visibleItemLabels: string[];
  calculatedColumnWidths: { width: string; isFixed: boolean }[];
  onAddRow: () => void;
  onRowChange: (
    newQrRow: QuestionnaireResponseItem,
    index: number,
    targetItemPath?: ItemPath
  ) => void;
  onRemoveRow: (index: number) => void;
  onSelectRow: (rowId: string) => void;
  onSelectAll: () => void;
  onReorderRows: (newTableRows: GroupTableRowModel[]) => void;
}

function GroupTableView(props: GroupTableViewProps) {
  const {
    qItem,
    qItemsIndexMap,
    groupCardElevation,
    isRepeated,
    readOnly,
    tableRows,
    selectedIds,
    visibleItemLabels,
    calculatedColumnWidths,
    itemPath,
    parentIsReadOnly,
    parentStyles,
    onAddRow,
    onRowChange,
    onRemoveRow,
    onSelectRow,
    onSelectAll,
    onReorderRows
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();

  const groupCollapsibleValue = getGroupCollapsible(qItem);

  const indeterminateValue = selectedIds.length > 0 && selectedIds.length < tableRows.length;
  const checkedValue = tableRows.length > 0 && selectedIds.length === tableRows.length;
  const ariaCheckedValue = indeterminateValue ? 'mixed' : checkedValue ? 'true' : 'false';

  const showExtraGTableInteractions = isRepeated && !readOnly;

  const itemTextToDisplay = getItemTextToDisplay(qItem);

  // If the table is collapsible, wrap it in an accordion
  if (groupCollapsibleValue) {
    const isDefaultOpen = groupCollapsibleValue === 'default-open';
    return (
      <GroupAccordion
        disableGutters
        defaultExpanded={isDefaultOpen}
        elevation={groupCardElevation}
        slotProps={{
          transition: { unmountOnExit: true, timeout: 250 }
        }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: '28px' }}>
          {itemTextToDisplay ? (
            <GroupHeading
              qItem={qItem}
              readOnly={readOnly}
              groupCardElevation={groupCardElevation}
            />
          ) : null}
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {itemTextToDisplay ? <Divider sx={{ mb: 1.5, opacity: 0.6 }} /> : null}
          <TableContainer component={Paper} elevation={groupCardElevation}>
            <Table>
              {showExtraGTableInteractions && !isGroupAddItemButtonHidden(qItem) ? (
                <caption>
                  <AddRowButton repeatGroups={tableRows} readOnly={readOnly} onAddItem={onAddRow} />
                </caption>
              ) : null}
              <TableHead>
                <TableRow>
                  <HeaderTableCell padding="none" />
                  {showExtraGTableInteractions ? (
                    <HeaderTableCell padding="none">
                      <StandardCheckbox
                        color="primary"
                        size="small"
                        indeterminate={indeterminateValue}
                        checked={checkedValue}
                        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
                        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
                        aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
                        role="checkbox"
                        aria-checked={ariaCheckedValue}
                        onChange={onSelectAll}
                        slotProps={{
                          input: {
                            'aria-label':
                              'Select all rows in ' + (qItem.text ?? `Unnamed ${qItem.type} item`)
                          }
                        }}
                      />
                    </HeaderTableCell>
                  ) : null}
                  {visibleItemLabels.map((visibleItemLabel) => (
                    <HeaderTableCell key={visibleItemLabel}>
                      <Box display="flex" alignItems="center" justifyContent="center">
                        {visibleItemLabel}
                      </Box>
                    </HeaderTableCell>
                  ))}
                  <TableCell padding="checkbox" />
                </TableRow>
              </TableHead>
              <GroupTableBody
                tableQItem={qItem}
                readOnly={readOnly}
                tableRows={tableRows}
                selectedIds={selectedIds}
                qItemsIndexMap={qItemsIndexMap}
                visibleItemLabels={visibleItemLabels}
                calculatedColumnWidths={calculatedColumnWidths}
                showExtraGTableInteractions={showExtraGTableInteractions}
                itemPath={itemPath}
                parentIsReadOnly={parentIsReadOnly}
                onRowChange={onRowChange}
                onRemoveRow={onRemoveRow}
                onSelectRow={onSelectRow}
                onReorderRows={onReorderRows}
              />
            </Table>
          </TableContainer>
        </AccordionDetails>
      </GroupAccordion>
    );
  }

  // Regular GTable
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
      <TableContainer component={Paper} elevation={groupCardElevation}>
        <Table>
          {showExtraGTableInteractions && !isGroupAddItemButtonHidden(qItem) ? (
            <caption>
              <AddRowButton repeatGroups={tableRows} readOnly={readOnly} onAddItem={onAddRow} />
            </caption>
          ) : null}
          <TableHead>
            <TableRow>
              <HeaderTableCell padding="none" />
              {showExtraGTableInteractions ? (
                <HeaderTableCell padding="none">
                  <StandardCheckbox
                    color="primary"
                    size="small"
                    indeterminate={indeterminateValue}
                    checked={checkedValue}
                    disabled={readOnly && readOnlyVisualStyle === 'disabled'}
                    readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
                    aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
                    role="checkbox"
                    aria-checked={ariaCheckedValue}
                    onChange={onSelectAll}
                    slotProps={{
                      input: {
                        'aria-label':
                          'Select all rows in ' + (qItem.text ?? `Unnamed ${qItem.type} item`)
                      }
                    }}
                  />
                </HeaderTableCell>
              ) : null}
              {visibleItemLabels.map((visibleItemLabel) => (
                <HeaderTableCell key={visibleItemLabel}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    {visibleItemLabel}
                  </Box>
                </HeaderTableCell>
              ))}
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>
          <GroupTableBody
            tableQItem={qItem}
            readOnly={readOnly}
            tableRows={tableRows}
            selectedIds={selectedIds}
            qItemsIndexMap={qItemsIndexMap}
            visibleItemLabels={visibleItemLabels}
            calculatedColumnWidths={calculatedColumnWidths}
            showExtraGTableInteractions={showExtraGTableInteractions}
            itemPath={itemPath}
            parentIsReadOnly={parentIsReadOnly}
            onRowChange={onRowChange}
            onRemoveRow={onRemoveRow}
            onSelectRow={onSelectRow}
            onReorderRows={onReorderRows}
          />
        </Table>
      </TableContainer>
    </QGroupContainerBox>
  );
}

export default GroupTableView;
