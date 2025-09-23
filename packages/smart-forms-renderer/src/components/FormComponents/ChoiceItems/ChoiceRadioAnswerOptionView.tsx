/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import ChoiceRadioAnswerOptionFields from './ChoiceRadioAnswerOptionFields';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import type { PropsWithIsRepeatedAttribute } from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import ItemLabel from '../ItemParts/ItemLabel';

interface ChoiceRadioAnswerOptionViewProps extends PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueChoice: string | null;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  onCheckedChange: (linkId: string) => void;
  onFocusLinkId: () => void;
  onClear: () => void;
}

function ChoiceRadioAnswerOptionView(props: ChoiceRadioAnswerOptionViewProps) {
  const {
    qItem,
    options,
    valueChoice,
    feedback,
    isRepeated,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    isTabled,
    onFocusLinkId,
    onCheckedChange,
    onClear
  } = props;

  if (isRepeated) {
    return (
      <ChoiceRadioAnswerOptionFields
        qItem={qItem}
        options={options}
        valueRadio={valueChoice}
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={expressionUpdated}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        isTabled={isTabled}
        onCheckedChange={onCheckedChange}
        onClear={onClear}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-radio-answer-option-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={onFocusLinkId}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceRadioAnswerOptionFields
            qItem={qItem}
            options={options}
            valueRadio={valueChoice}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={expressionUpdated}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            isTabled={isTabled}
            onCheckedChange={onCheckedChange}
            onClear={onClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerOptionView;
