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
  PropsWithIsTabledAttribute,
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

interface SingleItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
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
    (newQrItem: QuestionnaireResponseItem) => {
      updateEnableWhenItem(
        qItem.linkId,
        newQrItem.answer,
        parentIsRepeatGroup ? (parentRepeatGroupIndex ?? null) : null
      );

      if (qItem.repeats && qrItem?.answer && qrItem.answer.length > 0) {
        // Find the matching answer in qrItem by id
        const matchingAnswer = qrItem.answer.find((ans) => ans.id === newQrItem.answer?.[0]?.id);

        // Create updated newQrItem with the nested items from the matching answer
        const updatedQrItem = {
          ...newQrItem,
          answer: newQrItem.answer?.map((ans) => ({
            ...ans,
            item: matchingAnswer?.item || []
          }))
        };

        onQrItemChange(updatedQrItem);
      } else if (qrItem && qrItem.item && qrItem.item.length > 0) {
        onQrItemChange({ ...newQrItem, item: qrItem.item });
      } else {
        onQrItemChange(newQrItem);
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
    (newQrItem: QuestionnaireResponseItem) => {
      const updatedQrItem = qrItem ? { ...qrItem, answer: newQrItem.answer } : newQrItem;
      onQrItemChange(updatedQrItem);
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
