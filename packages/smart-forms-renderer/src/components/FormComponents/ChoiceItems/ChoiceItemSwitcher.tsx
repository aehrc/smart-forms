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

import React from 'react';
import { ChoiceItemControl } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import ChoiceRadioAnswerOptionItem from './ChoiceRadioAnswerOptionItem';
import ChoiceSelectAnswerOptionItem from './ChoiceSelectAnswerOptionItem';
import ChoiceCheckboxAnswerOptionItem from './ChoiceCheckboxAnswerOptionItem';
import ChoiceAutocompleteItem from './ChoiceAutocompleteItem';
import ChoiceSelectAnswerValueSetItem from './ChoiceSelectAnswerValueSetItem';
import { getChoiceControlType } from '../../../utils/choice';
import ChoiceRadioAnswerValueSetItem from './ChoiceRadioAnswerValueSetItem';
import ChoiceCheckboxAnswerValueSetItem from './ChoiceCheckboxAnswerValueSetItem';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import Typography from '@mui/material/Typography';

interface ChoiceItemSwitcherProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceItemSwitcher(props: ChoiceItemSwitcherProps) {
  const { qItem, qrItem, isRepeated, isTabled, showMinimalView, parentIsReadOnly, onQrItemChange } =
    props;

  const choiceControlType = getChoiceControlType(qItem);

  switch (choiceControlType) {
    case ChoiceItemControl.Radio:
      if (qItem.answerOption) {
        return (
          <ChoiceRadioAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <ChoiceRadioAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case ChoiceItemControl.Checkbox:
      if (qItem.answerOption) {
        return (
          <ChoiceCheckboxAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={qItem.repeats ?? false}
            showMinimalView={showMinimalView}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <ChoiceCheckboxAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={qItem.repeats ?? false}
            showMinimalView={showMinimalView}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case ChoiceItemControl.Autocomplete:
      return (
        <ChoiceAutocompleteItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      );
    case ChoiceItemControl.Select:
      if (qItem.answerOption) {
        return (
          <ChoiceSelectAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <ChoiceSelectAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return (
        <Typography>
          Something has went wrong when parsing item {qItem.linkId} - {qItem.text}
        </Typography>
      );
  }
}

export default ChoiceItemSwitcher;
