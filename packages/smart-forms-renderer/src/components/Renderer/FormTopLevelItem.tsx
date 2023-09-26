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

import React from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import FormBodyTabbed from './FormBodyTabbed';
import { containsTabs, isTabContainer } from '../../utils/tabs';
import GroupItem from '../FormComponents/GroupItem/GroupItem';
import SingleItem from '../FormComponents/SingleItem/SingleItem';
import type {
  PropsWithQrItemChangeHandler,
  PropsWithQrRepeatGroupChangeHandler
} from '../../interfaces/renderProps.interface';
import FormBodyCollapsible from './FormBodyCollapsible';
import useResponsive from '../../hooks/useResponsive';
import useHidden from '../../hooks/useHidden';
import GroupItemSwitcher from '../FormComponents/GroupItem/GroupItemSwitcher';
import useReadOnly from '../../hooks/useReadOnly';

interface FormTopLevelItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithQrRepeatGroupChangeHandler {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[];
}

function FormTopLevelItem(props: FormTopLevelItemProps) {
  const { topLevelQItem, topLevelQRItemOrItems, onQrItemChange, onQrRepeatGroupChange } = props;

  const itemIsTabContainer = isTabContainer(topLevelQItem);
  const itemContainsTabs = containsTabs(topLevelQItem);

  const isDesktop = useResponsive('up', 'lg');

  const itemIsGroup = topLevelQItem.type === 'group';

  const readOnly = useReadOnly(topLevelQItem, false);
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
    if (isDesktop) {
      return (
        <FormBodyTabbed
          key={topLevelQItem.linkId}
          topLevelQItem={topLevelQItem}
          topLevelQRItem={topLevelQRItem}
          onQrItemChange={onQrItemChange}
        />
      );
    }

    return (
      <FormBodyCollapsible
        key={topLevelQItem.linkId}
        topLevelQItem={topLevelQItem}
        topLevelQRItem={topLevelQRItem}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  // If form is untabbed, it is rendered as a regular group
  if (itemIsGroup) {
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
  return (
    <SingleItem
      key={topLevelQItem.linkId}
      qItem={topLevelQItem}
      qrItem={topLevelQRItem}
      isRepeated={false}
      isTabled={false}
      parentIsReadOnly={readOnly}
      onQrItemChange={onQrItemChange}
    />
  );
}

export default FormTopLevelItem;
