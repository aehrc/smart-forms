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

import { useCallback, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../types/choice.enum.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle.tsx';
import { getOpenLabelText } from '../../../../utils/itemControl.ts';
import QItemCheckboxSingleWithOpenLabel from '../QItemParts/QItemCheckboxSingleWithOpenLabel.tsx';
import { QFormGroup } from '../Item.styles.tsx';
import {
  getOldOpenLabelAnswer,
  updateQrOpenChoiceCheckboxAnswers
} from '../../../../utils/openChoice.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import debounce from 'lodash.debounce';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import { DEBOUNCE_DURATION } from '../../../../utils/debounce.ts';
import DisplayInstructions from '../DisplayItem/DisplayInstructions.tsx';
import LabelWrapper from '../QItemParts/LabelWrapper.tsx';

interface QItemOpenChoiceCheckboxProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemOpenChoiceCheckboxAnswerOption(props: QItemOpenChoiceCheckboxProps) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  // Init answers
  const qrOpenChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem);
  const answers = useMemo(() => qrOpenChoiceCheckbox.answer ?? [], [qrOpenChoiceCheckbox.answer]);

  // Init options and open label value
  const answerOptions = qItem.answerOption;
  let initialOpenLabelValue = '';
  let initialOpenLabelChecked = false;
  if (answerOptions) {
    const oldLabelAnswer = getOldOpenLabelAnswer(answers, answerOptions);
    if (oldLabelAnswer && oldLabelAnswer.valueString) {
      initialOpenLabelValue = oldLabelAnswer.valueString;
      initialOpenLabelChecked = true;
    }
  }
  const [openLabelValue, setOpenLabelValue] = useState(initialOpenLabelValue);
  const [openLabelChecked, setOpenLabelChecked] = useState(initialOpenLabelChecked);

  // Get additional rendering extensions
  const openLabelText = getOpenLabelText(qItem);
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Event handlers
  const handleValueChange = useCallback(
    (changedOptionValue: string | null, changedOpenLabelValue: string | null) => {
      if (!answerOptions) return null;

      let updatedQrChoiceCheckbox: QuestionnaireResponseItem | null = null;
      if (changedOptionValue) {
        updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
          changedOptionValue,
          null,
          answers,
          answerOptions,
          qrOpenChoiceCheckbox,
          CheckBoxOptionType.AnswerOption,
          isRepeated
        );
      } else if (changedOpenLabelValue !== null) {
        updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
          null,
          changedOpenLabelValue,
          answers,
          answerOptions,
          qrOpenChoiceCheckbox,
          CheckBoxOptionType.AnswerOption,
          isRepeated
        );
      }

      if (updatedQrChoiceCheckbox) {
        onQrItemChange(updatedQrChoiceCheckbox);
      }
    },
    [answerOptions, answers, isRepeated, onQrItemChange, qrOpenChoiceCheckbox]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateOpenLabelValueWithDebounce = useCallback(
    debounce((input: string) => {
      handleValueChange(null, input);
    }, DEBOUNCE_DURATION),
    [handleValueChange]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const openChoiceCheckbox = (
    <QFormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <QItemCheckboxSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              readOnly={readOnly}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer) === JSON.stringify(option)
              )}
              onCheckedChange={(changedValue) => handleValueChange(changedValue, null)}
            />
          );
        } else if (option['valueString']) {
          return (
            <QItemCheckboxSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
              readOnly={readOnly}
              isChecked={answers.some((answer) => answer.valueString === option.valueString)}
              onCheckedChange={(changedValue) => handleValueChange(changedValue, null)}
            />
          );
        } else if (option['valueInteger']) {
          return (
            <QItemCheckboxSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              readOnly={readOnly}
              isChecked={answers.some((answer) => answer.valueInteger === option.valueInteger)}
              onCheckedChange={(changedValue) => handleValueChange(changedValue, null)}
            />
          );
        } else {
          return null;
        }
      })}

      {openLabelText ? (
        <QItemCheckboxSingleWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          isChecked={openLabelChecked}
          onCheckedChange={(checked) => {
            handleValueChange(null, openLabelValue);
            setOpenLabelChecked(checked);
          }}
          onInputChange={(input) => {
            setOpenLabelValue(input);
            updateOpenLabelValueWithDebounce(input);
          }}
        />
      ) : null}
    </QFormGroup>
  );

  return (
    <FullWidthFormComponentBox data-test="q-item-open-choice-checkbox-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceCheckbox}
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default QItemOpenChoiceCheckboxAnswerOption;
