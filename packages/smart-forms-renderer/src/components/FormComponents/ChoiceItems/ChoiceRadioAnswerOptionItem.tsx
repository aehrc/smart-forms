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
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r4';
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
  const answerKey = qrItem?.answer?.[0].id;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const valueChoice = getQrChoiceValue(qrChoice);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const options = qItem.answerOption ?? [];

  // Process calculated expressions
  const { calcExpUpdated } = useCodingCalculatedExpression({
    qItem: qItem,
    valueInString: valueChoice ?? '',
    onChangeByCalcExpressionString: (newValueString: string) => {
      handleChange(newValueString);
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  });

  // Event handlers
  function handleChange(newValue: QuestionnaireItemAnswerOption | string | null) {
    // No options present or newValue is type null
    if (options.length === 0 || newValue === null) {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    // newValue is type string
    if (typeof newValue === 'string') {
      const qrAnswer = findInAnswerOptions(options, newValue);
      onQrItemChange(
        qrAnswer
          ? { ...createEmptyQrItem(qItem, answerKey), answer: [{ ...qrAnswer, id: answerKey }] }
          : createEmptyQrItem(qItem, answerKey)
      );
      return;
    }

    // newValue is type QuestionnaireItemAnswerOption
    onQrItemChange(
      newValue
        ? { ...createEmptyQrItem(qItem, answerKey), answer: [{ ...newValue, id: answerKey }] }
        : createEmptyQrItem(qItem, answerKey)
    );
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  // TODO This is in preparation of refactoring all choice answerOption fields into one component
  const choiceControlType = getChoiceControlType(qItem);

  switch (choiceControlType) {
    // TODO At the moment only this case will be executed because this switch statment was already in the parent components
    case ChoiceItemControl.Radio: {
      return (
        <ChoiceRadioAnswerOptionView
          qItem={qItem}
          options={options}
          valueChoice={valueChoice}
          isRepeated={isRepeated}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          onFocusLinkId={() => onFocusLinkId(qItem.linkId)}
          onCheckedChange={handleChange}
          onClear={handleClear}
        />
      );
    }

    case ChoiceItemControl.Select: {
      return (
        <ChoiceSelectAnswerOptionView
          qItem={qItem}
          options={options}
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
