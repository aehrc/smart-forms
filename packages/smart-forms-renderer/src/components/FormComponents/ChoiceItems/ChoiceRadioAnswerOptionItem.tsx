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
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerOptions, getChoiceControlType, getQrChoiceValue } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import { ChoiceItemControl } from '../../../interfaces/choice.enum';
import Typography from '@mui/material/Typography';
import useCodingCalculatedExpression from '../../../hooks/useCodingCalculatedExpression';
import ChoiceRadioAnswerOptionView from './ChoiceRadioAnswerOptionView';
import ChoiceSelectAnswerOptionView from './ChoiceSelectAnswerOptionView';

interface ChoiceRadioAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceRadioAnswerOptionItem(props: ChoiceRadioAnswerOptionItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const qrChoice = qrItem ?? createEmptyQrItem(qItem);
  const valueChoice = getQrChoiceValue(qrChoice);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Process calculated expressions
  const { calcExpUpdated } = useCodingCalculatedExpression({
    qItem: qItem,
    valueInString: valueChoice ?? '',
    onChangeByCalcExpressionString: (newValueString: string) => {
      handleChange(newValueString);
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem));
    }
  });

  // Event handlers
  function handleChange(newValue: string) {
    if (!qItem.answerOption) {
      onQrItemChange(createEmptyQrItem(qItem));
      return;
    }

    const qrAnswer = findInAnswerOptions(qItem.answerOption, newValue);
    onQrItemChange(
      qrAnswer ? { ...createEmptyQrItem(qItem), answer: [qrAnswer] } : createEmptyQrItem(qItem)
    );
  }

  // TODO This is in preparation of refactoring all choice answerOption fields into one component
  const choiceControlType = getChoiceControlType(qItem);

  switch (choiceControlType) {
    // TODO At the moment only this case will be executed because this switch statment was already in the parent components
    case ChoiceItemControl.Radio: {
      return (
        <ChoiceRadioAnswerOptionView
          qItem={qItem}
          valueChoice={valueChoice}
          isRepeated={isRepeated}
          isTabled={isTabled}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          onFocusLinkId={() => onFocusLinkId(qItem.linkId)}
          onCheckedChange={handleChange}
        />
      );
    }

    case ChoiceItemControl.Select: {
      return (
        <ChoiceSelectAnswerOptionView
          qItem={qItem}
          valueChoice={valueChoice}
          isRepeated={isRepeated}
          isTabled={isTabled}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          onFocusLinkId={() => onFocusLinkId(qItem.linkId)}
          onSelectChange={handleChange}
        />
      );
    }

    default: {
      return (
        <Typography>
          Something has went wrong when parsing item {qItem.linkId} - {qItem.text}
        </Typography>
      );
    }
  }
}

export default ChoiceRadioAnswerOptionItem;
