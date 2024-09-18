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
import FormBodyTabbed from './FormBodyTabbed';
import FormBodyPage from './FormBodyPage';
import { containsTabs, isTabContainer } from '../../utils/tabs';
import { containsPages, isPage } from '../../utils/page';
import GroupItem from '../FormComponents/GroupItem/GroupItem';
import SingleItem from '../FormComponents/SingleItem/SingleItem';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithQrRepeatGroupChangeHandler
} from '../../interfaces/renderProps.interface';
import FormBodyCollapsible from './FormBodyCollapsible';
import useResponsive from '../../hooks/useResponsive';
import useHidden from '../../hooks/useHidden';
import GroupItemSwitcher from '../FormComponents/GroupItem/GroupItemSwitcher';
import useReadOnly from '../../hooks/useReadOnly';
import Box from '@mui/material/Box';
import { isRepeatItemAndNotCheckbox, isSpecificItemControl } from '../../utils';
import GroupTable from '../FormComponents/Tables/GroupTable';
import RepeatItem from '../FormComponents/RepeatItem/RepeatItem';
import GridGroup from '../FormComponents/GridGroup/GridGroup';

interface FormTopLevelItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithQrRepeatGroupChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null;
}

function FormTopLevelItem(props: FormTopLevelItemProps) {
  const {
    topLevelQItem,
    topLevelQRItemOrItems,
    parentIsReadOnly,
    onQrItemChange,
    onQrRepeatGroupChange
  } = props;

  const itemIsTabContainer = isTabContainer(topLevelQItem);
  const itemContainsTabs = containsTabs(topLevelQItem);

  const itemIsPageContainer = isPage(topLevelQItem);
  const itemContainsPages = containsPages(topLevelQItem);

  const isTablet = useResponsive('up', 'md');

  const itemIsGroup = topLevelQItem.type === 'group';

  const readOnly = useReadOnly(topLevelQItem, parentIsReadOnly);
  const itemIsHidden = useHidden(topLevelQItem);
  if (itemIsHidden) {
    return null;
  }

  // If item has multiple answers, use a group item switcher to determine how to render it.
  const hasMultipleAnswers = Array.isArray(topLevelQRItemOrItems);
  if (hasMultipleAnswers) {
    return (
      <GroupItemSwitcher
        qItem={topLevelQItem}
        qrItemOrItems={topLevelQRItemOrItems}
        groupCardElevation={1}
        parentIsReadOnly={readOnly}
        onQrItemChange={onQrItemChange}
        onQrRepeatGroupChange={onQrRepeatGroupChange}
      />
    );
  }

  // At this point, item only has one answer
  const topLevelQRItem = topLevelQRItemOrItems;

  // If form is tabbed, it is rendered as a tabbed form
  if (itemContainsTabs || itemIsTabContainer) {
    if (isTablet) {
      return (
        <FormBodyTabbed
          key={topLevelQItem.linkId}
          topLevelQItem={topLevelQItem}
          topLevelQRItem={topLevelQRItem}
          parentIsReadOnly={readOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    }

    return (
      <FormBodyCollapsible
        key={topLevelQItem.linkId}
        topLevelQItem={topLevelQItem}
        topLevelQRItem={topLevelQRItem}
        parentIsReadOnly={readOnly}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  if (itemContainsPages || itemIsPageContainer) {
    return (
      <FormBodyPage
        key={topLevelQItem.linkId}
        topLevelQItem={topLevelQItem}
        topLevelQRItem={topLevelQRItem}
        parentIsReadOnly={readOnly}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  // If form is untabbed, it is rendered as a regular group
  if (itemIsGroup) {
    // Item is 'grid'
    const itemIsGrid = isSpecificItemControl(topLevelQItem, 'grid');
    if (itemIsGrid) {
      return (
        <GridGroup
          qItem={topLevelQItem}
          qrItem={topLevelQRItem}
          groupCardElevation={1}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    }

    // GroupTable "gtable" can be rendered with either repeats:true or false
    if (isSpecificItemControl(topLevelQItem, 'gtable')) {
      return (
        <GroupTable
          key={topLevelQItem.linkId}
          qItem={topLevelQItem}
          qrItems={topLevelQRItem ? [topLevelQRItem] : []}
          groupCardElevation={1}
          isRepeated={false}
          parentIsReadOnly={parentIsReadOnly}
          onQrRepeatGroupChange={onQrRepeatGroupChange}
        />
      );
    }

    return (
      <GroupItem
        key={topLevelQItem.linkId}
        qItem={topLevelQItem}
        qrItem={topLevelQRItem}
        groupCardElevation={1}
        isRepeated={false}
        parentIsReadOnly={readOnly}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  // Otherwise, it is rendered as a non-group item
  const itemRepeatsAndIsNotCheckbox = isRepeatItemAndNotCheckbox(topLevelQItem);
  if (itemRepeatsAndIsNotCheckbox) {
    return (
      <Box mt={1}>
        <RepeatItem
          key={topLevelQItem.linkId}
          qItem={topLevelQItem}
          qrItem={topLevelQRItem}
          groupCardElevation={1}
          parentIsReadOnly={readOnly}
          onQrItemChange={onQrItemChange}
        />
      </Box>
    );
  }

  return (
    <Box mt={1}>
      <SingleItem
        key={topLevelQItem.linkId}
        qItem={topLevelQItem}
        qrItem={topLevelQRItem}
        isRepeated={false}
        isTabled={false}
        groupCardElevation={1}
        parentIsReadOnly={readOnly}
        onQrItemChange={onQrItemChange}
      />
    </Box>
  );
}

export default FormTopLevelItem;
