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

import React, { useCallback } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import SingleItemSwitcher from './SingleItemSwitcher';
import useHidden from '../../../hooks/useHidden';
import useReadOnly from '../../../hooks/useReadOnly';
import SingleNestedItems from './SingleNestedItems';

interface SingleItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

function SingleItem(props: SingleItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    parentIsRepeatGroup,
    parentRepeatGroupIndex,
    onQrItemChange
  } = props;

  const updateEnableWhenItem = useQuestionnaireStore.use.updateEnableWhenItem();

  const handleQrItemChange = useCallback(
    (newQrItem: QuestionnaireResponseItem) => {
      updateEnableWhenItem(
        qItem.linkId,
        newQrItem.answer,
        parentIsRepeatGroup ? parentRepeatGroupIndex ?? null : null
      );

      if (qrItem && qrItem.item && qrItem.item.length > 0) {
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
      const updatedQrItem = qrItem ? { ...qrItem, item: newQrItem.item } : newQrItem;
      onQrItemChange(updatedQrItem);
    },
    [qrItem, onQrItemChange]
  );

  const qItemHasNestedItems = !!qItem.item && qItem.item.length > 0;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const itemIsHidden = useHidden(qItem, parentRepeatGroupIndex);
  if (itemIsHidden) {
    return null;
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
        onQrItemChange={handleQrItemChange}
      />
      {qItemHasNestedItems ? (
        <SingleNestedItems
          qItem={qItem}
          qrItem={qrItem}
          groupCardElevation={groupCardElevation}
          parentIsReadOnly={readOnly}
          onQrItemChange={handleQrItemChangeWithNestedItems}
        />
      ) : null}
    </>
  );
}

export default SingleItem;
