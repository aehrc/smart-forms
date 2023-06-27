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

import type { ChangeEvent } from 'react';
import { memo, useState } from 'react';
import { Grid } from '@mui/material';
import { QItemChoiceOrientation } from '../../../../types/choice.enum.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { getOpenLabelText } from '../../../../utils/itemControl.ts';
import { QRadioGroup } from '../Item.styles.tsx';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions.tsx';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import { getOldOpenLabelAnswer } from '../../../../utils/openChoice.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import QItemChoiceRadioSingle from '../QItemChoice/QItemChoiceRadioSingle.tsx';
import { findInAnswerOptions, getQrChoiceValue } from '../../../../utils/choice.ts';
import QItemRadioButtonWithOpenLabel from '../QItemParts/QItemRadioButtonWithOpenLabel.tsx';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';

interface QItemOpenChoiceRadioProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemOpenChoiceRadioAnswerOption(props: QItemOpenChoiceRadioProps) {
  const { qItem, qrItem, onQrItemChange, orientation } = props;

  // Init answers
  const qrOpenChoiceRadio = qrItem ?? createEmptyQrItem(qItem);
  let valueRadio: string | null = getQrChoiceValue(qrOpenChoiceRadio, true);
  const answers = qrOpenChoiceRadio.answer ?? [];

  // Init empty open label
  const answerOptions = qItem.answerOption;
  let initialOpenLabelValue = '';
  let initialOpenLabelSelected = false;
  if (answerOptions) {
    const oldLabelAnswer = getOldOpenLabelAnswer(answers, answerOptions);
    if (oldLabelAnswer && oldLabelAnswer.valueString) {
      initialOpenLabelValue = oldLabelAnswer.valueString;
      initialOpenLabelSelected = true;
      valueRadio = initialOpenLabelValue;
    }
  }

  const [openLabelValue, setOpenLabelValue] = useState<string | null>(initialOpenLabelValue);
  const [openLabelSelected, setOpenLabelSelected] = useState(initialOpenLabelSelected);

  // Allow open label to remain selected even if its input was cleared
  if (openLabelSelected && valueRadio === null) {
    valueRadio = '';
  }

  // Get additional rendering extensions
  const openLabelText = getOpenLabelText(qItem);
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Event handlers
  function handleValueChange(
    changedOptionValue: string | null,
    changedOpenLabelValue: string | null
  ) {
    if (!answerOptions) return null;

    if (changedOptionValue !== null) {
      if (qItem.answerOption) {
        const qrAnswer = findInAnswerOptions(qItem.answerOption, changedOptionValue);

        // If selected answer can be found in options, it is a non-open label selection
        if (qrAnswer) {
          onQrItemChange({ ...createEmptyQrItem(qItem), answer: [qrAnswer] });
          setOpenLabelSelected(false);
        } else {
          // Otherwise, it is an open-label selection
          onQrItemChange({
            ...createEmptyQrItem(qItem),
            answer: [{ valueString: changedOptionValue }]
          });
          setOpenLabelValue(changedOptionValue);
          setOpenLabelSelected(true);
        }
      }
    }

    if (changedOpenLabelValue !== null) {
      setOpenLabelValue(changedOpenLabelValue);

      if (changedOpenLabelValue === '') {
        onQrItemChange(createEmptyQrItem(qItem));
      } else {
        setOpenLabelValue(changedOpenLabelValue);
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueString: changedOpenLabelValue }]
        });
      }
    }
  }

  const openChoiceRadio = (
    <QRadioGroup
      row={orientation === QItemChoiceOrientation.Horizontal}
      name={qItem.text}
      id={qItem.id}
      onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(e.target.value, null)}
      value={valueRadio}
      data-test="q-item-radio-group">
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <QItemChoiceRadioSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              readOnly={readOnly}
            />
          );
        } else if (option['valueString']) {
          return (
            <QItemChoiceRadioSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
              readOnly={readOnly}
            />
          );
        } else if (option['valueInteger']) {
          return (
            <QItemChoiceRadioSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              readOnly={readOnly}
            />
          );
        } else {
          return null;
        }
      })}

      {openLabelText ? (
        <QItemRadioButtonWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          readOnly={readOnly}
          isSelected={openLabelSelected}
          onInputChange={(input) => handleValueChange(null, input)}
        />
      ) : null}
    </QRadioGroup>
  );

  return (
    <FullWidthFormComponentBox data-test="q-item-open-choice-radio-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceRadio}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default memo(QItemOpenChoiceRadioAnswerOption);
