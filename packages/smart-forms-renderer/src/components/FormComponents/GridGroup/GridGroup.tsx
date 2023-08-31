/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import type { PropsWithQrItemChangeHandler } from '../../../interfaces/renderProps.interface';
import { createQrGroup, updateQrGroup } from '../../../utils/qrItem';
import useHidden from '../../../hooks/useHidden';
import { QGroupContainerBox } from '../../Box.styles';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import { mapQItemsIndex } from '../../../utils/mapItem';
import GridTable from './GridTable';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';

interface GridGroupProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
}

function GridGroup(props: GridGroupProps) {
  const { qItem, qrItem, groupCardElevation, onQrItemChange } = props;

  const qRowItems = qItem.item;
  const qrGroup = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const qrRowItems = qrGroup.item;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const columnLabels: string[] = useMemo(
    () => qRowItems?.[0].item?.map((firstItem) => firstItem.text ?? ' ') ?? [],
    [qRowItems]
  );

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
    updateQrGroup(newQrItem, null, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup);
  }

  return (
    <>
      <QGroupContainerBox cardElevation={groupCardElevation} isRepeated={false} py={3}>
        <Typography fontSize={13} variant="h6">
          <LabelWrapper qItem={qItem} />
        </Typography>
        <Divider sx={{ my: 1 }} light />

        <TableContainer component={Paper} elevation={groupCardElevation}>
          <GridTable
            qItems={qRowItems}
            qrItems={qrRowItems}
            qItemsIndexMap={qItemsIndexMap}
            columnLabels={columnLabels}
            onQrItemChange={handleRowChange}
          />
        </TableContainer>
      </QGroupContainerBox>
    </>
  );
}

export default GridGroup;
