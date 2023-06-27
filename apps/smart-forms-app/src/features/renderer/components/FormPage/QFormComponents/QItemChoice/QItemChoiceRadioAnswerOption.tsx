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
import { memo } from 'react';
import { Grid } from '@mui/material';
import { QItemChoiceOrientation } from '../../../../types/choice.enum.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerOptions, getQrChoiceValue } from '../../../../utils/choice.ts';
import QItemChoiceRadioSingle from './QItemChoiceRadioSingle.tsx';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { QRadioGroup } from '../Item.styles.tsx';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions.tsx';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceRadioAnswerOption(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  // Init input value
  const qrChoiceRadio = qrItem ?? createEmptyQrItem(qItem);
  const valueRadio = getQrChoiceValue(qrChoiceRadio);

  // Get additional rendering extensions
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Event handlers
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...createEmptyQrItem(qItem), answer: [qrAnswer] });
      }
    }
  }

  const choiceRadio = (
    <QRadioGroup
      row={orientation === QItemChoiceOrientation.Horizontal}
      name={qItem.text}
      id={qItem.id}
      onChange={handleChange}
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
    </QRadioGroup>
  );

  const renderQItemChoiceRadio = isRepeated ? (
    <>{choiceRadio}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-choice-radio-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceRadio}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemChoiceRadio}</>;
}

export default memo(QItemChoiceRadioAnswerOption);
