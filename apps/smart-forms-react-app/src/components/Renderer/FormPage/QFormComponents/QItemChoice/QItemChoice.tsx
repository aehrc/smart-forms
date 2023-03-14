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
import { QItemChoiceControl } from '../../../../../interfaces/Enums';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemChoiceRadioAnswerOption from './QItemChoiceRadioAnswerOption';
import QItemChoiceSelectAnswerOption from './QItemChoiceSelectAnswerOption';
import QItemChoiceCheckboxAnswerOption from './QItemChoiceCheckboxAnswerOption';
import QItemChoiceAutocomplete from './QItemChoiceAutocomplete';
import QItemChoiceSelectAnswerValueSet from './QItemChoiceSelectAnswerValueSet';
import {
  getChoiceControlType,
  getChoiceOrientation
} from '../../../../../functions/ChoiceFunctions';
import QItemChoiceRadioAnswerValueSet from './QItemChoiceRadioAnswerValueSet';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../interfaces/Interfaces';
import QItemChoiceCheckboxAnswerValueSet from './QItemChoiceCheckboxAnswerValueSet';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoice(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const orientation = getChoiceOrientation(qItem);

  switch (getChoiceControlType(qItem)) {
    case QItemChoiceControl.Radio:
      if (qItem.answerValueSet) {
        return (
          <QItemChoiceRadioAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      } else {
        return (
          <QItemChoiceRadioAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      }
    case QItemChoiceControl.Checkbox:
      if (qItem.answerValueSet) {
        return (
          <QItemChoiceCheckboxAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={qItem['repeats'] ?? false}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      } else {
        return (
          <QItemChoiceCheckboxAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={qItem['repeats'] ?? false}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      }
    case QItemChoiceControl.Autocomplete:
      return (
        <QItemChoiceAutocomplete
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemChoiceControl.Select:
      if (qItem.answerValueSet) {
        return (
          <QItemChoiceSelectAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemChoiceSelectAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return null;
  }
}

export default QItemChoice;
