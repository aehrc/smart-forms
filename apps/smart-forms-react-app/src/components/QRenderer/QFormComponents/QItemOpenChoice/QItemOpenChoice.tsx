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
import { QItemOpenChoiceControl } from '../../../../interfaces/Enums';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemOpenChoiceSelectAnswerOption from './QItemOpenChoiceSelectAnswerOption';
import QItemOpenChoiceSelectAnswerValueSet from './QItemOpenChoiceSelectAnswerValueSet';
import QItemOpenChoiceAutocomplete from './QItemOpenChoiceAutocomplete';
import { getOpenChoiceControlType } from '../../../../functions/OpenChoiceFunctions';
import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { getChoiceOrientation } from '../../../../functions/ChoiceFunctions';
import QItemOpenChoiceCheckboxAnswerOption from './QItemOpenChoiceCheckboxAnswerOption';
import QItemOpenChoiceRadioAnswerOption from './QItemOpenChoiceRadioAnswerOption';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoice(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const orientation = getChoiceOrientation(qItem);

  switch (getOpenChoiceControlType(qItem)) {
    case QItemOpenChoiceControl.Checkbox:
      return (
        <QItemOpenChoiceCheckboxAnswerOption
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={qItem['repeats'] ?? false}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case QItemOpenChoiceControl.Radio:
      return (
        <QItemOpenChoiceRadioAnswerOption
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={qItem['repeats'] ?? false}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case QItemOpenChoiceControl.Autocomplete:
      return (
        <QItemOpenChoiceAutocomplete
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemOpenChoiceControl.Select:
      if (qItem.answerValueSet) {
        return (
          <QItemOpenChoiceSelectAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemOpenChoiceSelectAnswerOption
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

export default QItemOpenChoice;
