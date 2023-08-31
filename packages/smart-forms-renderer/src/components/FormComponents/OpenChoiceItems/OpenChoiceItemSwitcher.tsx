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
import { OpenChoiceItemControl } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import OpenChoiceSelectAnswerOptionItem from './OpenChoiceSelectAnswerOptionItem';
import OpenChoiceSelectAnswerValueSetItem from './OpenChoiceSelectAnswerValueSetItem';
import OpenChoiceAutocompleteItem from './OpenChoiceAutocompleteItem';
import { getOpenChoiceControlType } from '../../../utils/openChoice';
import { getChoiceOrientation } from '../../../utils/choice';
import OpenChoiceCheckboxAnswerOptionItem from './OpenChoiceCheckboxAnswerOptionItem';
import OpenChoiceRadioAnswerOptionItem from './OpenChoiceRadioAnswerOptionItem';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';

interface OpenChoiceItemSwitcherProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function OpenChoiceItemSwitcher(props: OpenChoiceItemSwitcherProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const orientation = getChoiceOrientation(qItem);

  switch (getOpenChoiceControlType(qItem)) {
    case OpenChoiceItemControl.Checkbox:
      return (
        <OpenChoiceCheckboxAnswerOptionItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={qItem['repeats'] ?? false}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case OpenChoiceItemControl.Radio:
      return (
        <OpenChoiceRadioAnswerOptionItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={qItem['repeats'] ?? false}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case OpenChoiceItemControl.Autocomplete:
      return (
        <OpenChoiceAutocompleteItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case OpenChoiceItemControl.Select:
      if (qItem.answerValueSet) {
        return (
          <OpenChoiceSelectAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <OpenChoiceSelectAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return null;
  }
}

export default OpenChoiceItemSwitcher;
