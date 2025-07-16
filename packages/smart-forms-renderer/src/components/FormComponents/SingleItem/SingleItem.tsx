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

import React, { useCallback, useMemo } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import useHidden from '../../../hooks/useHidden';
import useReadOnly from '../../../hooks/useReadOnly';
import { shouldRenderNestedItems } from '../../../utils/extensions';
import SingleItemView from './SingleItemView';
import type { ItemPath } from '../../../interfaces/itemPath.interface';

interface SingleItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

/**
 * Main component to render a repeating, non-group Questionnaire item.
 * Store and manages the state of multiple instances of SingleItem in a repeating item.
 *
 * @author Sean Fong
 */
function SingleItem(props: SingleItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated = false,
    isTabled = false,
    groupCardElevation,
    parentIsReadOnly,
    feedbackFromParent,
    parentIsRepeatGroup,
    parentRepeatGroupIndex,
    parentStyles,
    onQrItemChange
  } = props;

  const updateEnableWhenItem = useQuestionnaireStore.use.updateEnableWhenItem();

  const handleQrItemChange = useCallback(
    (newQrItem: QuestionnaireResponseItem, targetItemPath?: ItemPath) => {
      updateEnableWhenItem(
        qItem.linkId,
        newQrItem.answer,
        parentIsRepeatGroup ? (parentRepeatGroupIndex ?? null) : null
      );

      if (qrItem && qrItem.item && qrItem.item.length > 0) {
        onQrItemChange({ ...newQrItem, item: qrItem.item }, targetItemPath);
      } else {
        onQrItemChange(newQrItem, targetItemPath);
      }
    },
    [
      qrItem,
      updateEnableWhenItem,
      qItem.linkId,
      parentIsRepeatGroup,
      parentRepeatGroupIndex,
      onQrItemChange
    ]
  );

  const handleQrItemChangeWithNestedItems = useCallback(
    (newQrItem: QuestionnaireResponseItem, targetItemPath?: ItemPath) => {
      const updatedQrItem = qrItem ? { ...qrItem, item: newQrItem.item } : newQrItem;
      onQrItemChange(updatedQrItem, targetItemPath);
    },
    [qrItem, onQrItemChange]
  );

  const itemHasNestedItems = useMemo(
    () => !!qItem.item && qItem.item.length > 0 && shouldRenderNestedItems(qItem),
    [qItem]
  );

  const readOnly = useReadOnly(qItem, parentIsReadOnly, parentRepeatGroupIndex);
  const itemIsHidden = useHidden(qItem, parentRepeatGroupIndex);

  return (
    <SingleItemView
      qItem={qItem}
      qrItem={qrItem}
      itemPath={itemPath}
      itemIsHidden={itemIsHidden}
      itemHasNestedItems={itemHasNestedItems}
      isRepeated={isRepeated}
      isTabled={isTabled}
      groupCardElevation={groupCardElevation}
      parentIsReadOnly={readOnly}
      feedbackFromParent={feedbackFromParent}
      parentStyles={parentStyles}
      onQrItemChange={handleQrItemChange}
      onQrItemChangeWithNestedItems={handleQrItemChangeWithNestedItems}
    />
  );
}

export default SingleItem;
