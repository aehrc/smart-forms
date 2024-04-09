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
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import useHidden from '../../../hooks/useHidden';
import { QGroupContainerBox } from '../../Box.styles';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import { mapQItemsIndex } from '../../../utils/mapItem';
import GridTable from './GridTable';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';

interface GridGroupProps
  extends PropsWithQrItemChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

function GridGroup(props: GridGroupProps) {
  const { qItem, qrItem, groupCardElevation, showMinimalView, parentIsReadOnly, onQrItemChange } =
    props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const qRowItems = qItem.item;
  const qrGroup = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const qrRowItems = qrGroup.item;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const columnLabels: string[] = useMemo(
    () => qRowItems?.[0].item?.map((firstItem) => firstItem.text ?? ' ') ?? [],
    [qRowItems]
  );

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
  function handleRowChange(newQrItem: QuestionnaireResponseItem) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrItemsInGroup(newQrItem, null, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup);
  }

  if (showMinimalView) {
    return (
      <QGroupContainerBox cardElevation={groupCardElevation} isRepeated={false} py={1}>
        <TableContainer component={Paper} elevation={groupCardElevation}>
          <GridTable
            qItems={qRowItems}
            qrItems={qrRowItems}
            qItemsIndexMap={qItemsIndexMap}
            columnLabels={columnLabels}
            showMinimalView={showMinimalView}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={handleRowChange}
          />
        </TableContainer>
      </QGroupContainerBox>
    );
  }

  return (
    <QGroupContainerBox
      cardElevation={groupCardElevation}
      isRepeated={false}
      py={3}
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      {qItem.text ? (
        <>
          <Typography
            fontSize={13}
            variant="h6"
            color={readOnly ? 'text.secondary' : 'text.primary'}>
            <LabelWrapper qItem={qItem} readOnly={readOnly} />
          </Typography>
          <Divider sx={{ my: 1 }} light />
        </>
      ) : null}

      <TableContainer component={Paper} elevation={groupCardElevation}>
        <GridTable
          qItems={qRowItems}
          qrItems={qrRowItems}
          qItemsIndexMap={qItemsIndexMap}
          columnLabels={columnLabels}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={handleRowChange}
        />
      </TableContainer>
    </QGroupContainerBox>
  );
}

export default GridGroup;
