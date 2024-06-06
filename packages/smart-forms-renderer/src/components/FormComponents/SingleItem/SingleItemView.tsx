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

import React from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import SingleItemSwitcher from './SingleItemSwitcher';
import SingleNestedItems from './SingleNestedItems';
import { GroupCard } from '../GroupItem/GroupItem.styles';
import { QGroupContainerBox } from '../../Box.styles';
import { getGroupCollapsible } from '../../../utils/qItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import StopPropagationWrapper from './StopPropagationWrapper';
import {
  NestedSingleItemAccordion,
  NestedSingleItemAccordionSummary,
  NestedSingleItemAccordionWrapper
} from './NestedSingleItemAccordion.styles';
import useReadOnly from '../../../hooks/useReadOnly';
import Box from '@mui/material/Box';

interface SingleItemViewProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  itemIsHidden: boolean;
  itemHasNestedItems: boolean;
  groupCardElevation: number;
  onQrItemChangeWithNestedItems: (newQrItem: QuestionnaireResponseItem) => void;
}

function SingleItemView(props: SingleItemViewProps) {
  const {
    qItem,
    qrItem,
    itemIsHidden,
    itemHasNestedItems,
    isRepeated,
    isTabled,
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    onQrItemChange,
    onQrItemChangeWithNestedItems
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const groupCollapsibleValue = getGroupCollapsible(qItem);

  // Item hidden, do not render
  if (itemIsHidden) {
    return null;
  }

  // Item has nested items and is collapsible
  if (itemHasNestedItems && groupCollapsibleValue) {
    const isDefaultOpen = groupCollapsibleValue === 'default-open';
    return (
      <NestedSingleItemAccordionWrapper isRepeated={isRepeated}>
        <NestedSingleItemAccordion
          disableGutters
          defaultExpanded={isDefaultOpen}
          elevation={groupCardElevation}
          slotProps={{
            transition: { unmountOnExit: true, timeout: 250 }
          }}>
          <NestedSingleItemAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box width="100%">
              <StopPropagationWrapper>
                <SingleItemSwitcher
                  qItem={qItem}
                  qrItem={qrItem}
                  isRepeated={isRepeated}
                  isTabled={isTabled}
                  showMinimalView={showMinimalView}
                  parentIsReadOnly={readOnly}
                  onQrItemChange={onQrItemChange}
                />
              </StopPropagationWrapper>
            </Box>
          </NestedSingleItemAccordionSummary>

          <AccordionDetails sx={{ pt: 0 }}>
            {/* This box with marginRight:"24px" below is to align the parent item with the nested child items (due to space taken by the expand button */}
            <Box mr={3}>
              <SingleNestedItems
                qItem={qItem}
                qrItem={qrItem}
                groupCardElevation={groupCardElevation}
                parentIsReadOnly={readOnly}
                onQrItemChange={onQrItemChangeWithNestedItems}
              />
            </Box>
          </AccordionDetails>
        </NestedSingleItemAccordion>
      </NestedSingleItemAccordionWrapper>
    );
  }

  // Item has nested items but is not collapsible
  if (itemHasNestedItems) {
    return (
      <QGroupContainerBox
        cardElevation={groupCardElevation}
        isRepeated={isRepeated}
        data-test="q-item-group-box">
        <GroupCard elevation={groupCardElevation} isRepeated={isRepeated}>
          <SingleItemSwitcher
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            showMinimalView={showMinimalView}
            parentIsReadOnly={readOnly}
            onQrItemChange={onQrItemChange}
          />
          <SingleNestedItems
            qItem={qItem}
            qrItem={qrItem}
            groupCardElevation={groupCardElevation}
            parentIsReadOnly={readOnly}
            onQrItemChange={onQrItemChangeWithNestedItems}
          />
        </GroupCard>
      </QGroupContainerBox>
    );
  }

  return (
    <>
      <SingleItemSwitcher
        qItem={qItem}
        qrItem={qrItem}
        isRepeated={isRepeated}
        isTabled={isTabled}
        showMinimalView={showMinimalView}
        parentIsReadOnly={readOnly}
        onQrItemChange={onQrItemChange}
      />
    </>
  );
}

export default SingleItemView;
