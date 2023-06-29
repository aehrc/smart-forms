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

import { QItemChoiceControl } from '../../../../types/choice.enum.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import QItemChoiceRadioAnswerOption from './QItemChoiceRadioAnswerOption.tsx';
import QItemChoiceSelectAnswerOption from './QItemChoiceSelectAnswerOption.tsx';
import QItemChoiceCheckboxAnswerOption from './QItemChoiceCheckboxAnswerOption.tsx';
import QItemChoiceAutocomplete from './QItemChoiceAutocomplete.tsx';
import QItemChoiceSelectAnswerValueSet from './QItemChoiceSelectAnswerValueSet.tsx';
import { getChoiceControlType, getChoiceOrientation } from '../../../../utils/choice.ts';
import QItemChoiceRadioAnswerValueSet from './QItemChoiceRadioAnswerValueSet.tsx';
import QItemChoiceCheckboxAnswerValueSet from './QItemChoiceCheckboxAnswerValueSet.tsx';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';

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
  const choiceControlType = getChoiceControlType(qItem);

  switch (choiceControlType) {
    case QItemChoiceControl.Radio:
      if (qItem.answerOption) {
        return (
          <QItemChoiceRadioAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      } else {
        return (
          <QItemChoiceRadioAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      }
    case QItemChoiceControl.Checkbox:
      if (qItem.answerOption) {
        return (
          <QItemChoiceCheckboxAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={qItem['repeats'] ?? false}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      } else {
        return (
          <QItemChoiceCheckboxAnswerValueSet
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
      if (qItem.answerOption) {
        return (
          <QItemChoiceSelectAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemChoiceSelectAnswerValueSet
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

export default QItemChoice;
