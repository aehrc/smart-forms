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

import React, { useCallback } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import useQuestionnaireStore from '../../../stores/useQuestionnaireStore';
import SingleItemSwitcher from './SingleItemSwitcher';
import useHidden from '../../../hooks/useHidden';

interface SingleItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function SingleItem(props: SingleItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const updateEnableWhenItem = useQuestionnaireStore((state) => state.updateEnableWhenItem);

  const handleQrItemChange = useCallback(
    (newQrItem: QuestionnaireResponseItem) => {
      if (newQrItem.answer) {
        updateEnableWhenItem(qItem.linkId, newQrItem.answer);
      }
      onQrItemChange(newQrItem);
    },
    [updateEnableWhenItem, onQrItemChange, qItem.linkId]
  );

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  return (
    <SingleItemSwitcher
      qItem={qItem}
      qrItem={qrItem}
      isRepeated={isRepeated}
      isTabled={isTabled}
      onQrItemChange={handleQrItemChange}
    />
  );
}

export default SingleItem;
