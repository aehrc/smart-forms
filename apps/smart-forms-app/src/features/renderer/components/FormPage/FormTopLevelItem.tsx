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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import FormBodyTabbed from './FormBodyTabbed.tsx';
import { containsTabs, isTabContainer } from '../../utils/tabs.ts';
import GroupItem from './QFormComponents/GroupItem/GroupItem.tsx';
import SingleItem from './QFormComponents/SingleItem/SingleItem.tsx';
import type { PropsWithQrItemChangeHandler } from '../../types/renderProps.interface.ts';
import FormBodyCollapsible from './FormBodyCollapsible.tsx';
import useResponsive from '../../../../hooks/useResponsive.ts';

interface FormTopLevelItemProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem;
}

function FormTopLevelItem(props: FormTopLevelItemProps) {
  const { topLevelQItem, topLevelQRItem, onQrItemChange } = props;

  const itemIsTabContainer = isTabContainer(topLevelQItem);
  const itemContainsTabs = containsTabs(topLevelQItem);

  const isDesktop = useResponsive('up', 'lg');

  const itemIsGroup = topLevelQItem.type === 'group';

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
        onQrItemChange={onQrItemChange}
        isRepeated={false}
      />
    );
  }

  // Otherwise, it is rendered as a non-group item
  return (
    <SingleItem
      key={topLevelQItem.linkId}
      qItem={topLevelQItem}
      qrItem={topLevelQRItem}
      isTabled={false}
      onQrItemChange={onQrItemChange}
      isRepeated={false}
    />
  );
}

export default FormTopLevelItem;
