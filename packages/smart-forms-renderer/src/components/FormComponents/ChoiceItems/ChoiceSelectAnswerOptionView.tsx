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

import React, { useMemo } from 'react';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { findInAnswerOptions } from '../../../utils/choice';
import ChoiceSelectAnswerOptionFields from './ChoiceSelectAnswerOptionFields';
import ItemLabel from '../ItemParts/ItemLabel';

interface ChoiceSelectAnswerOptionViewProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueChoice: string | null;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  onSelectChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
  onFocusLinkId: () => void;
}

function ChoiceSelectAnswerOptionView(props: ChoiceSelectAnswerOptionViewProps) {
  const {
    qItem,
    options,
    valueChoice,
    feedback,
    isRepeated,
    isTabled,
    renderingExtensions,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    onFocusLinkId,
    onSelectChange
  } = props;

  const valueSelect: QuestionnaireItemAnswerOption | null = useMemo(
    () => findInAnswerOptions(options, valueChoice ?? '') ?? null,
    [options, valueChoice]
  );

  if (isRepeated) {
    return (
      <ChoiceSelectAnswerOptionFields
        qItem={qItem}
        options={options}
        valueSelect={valueSelect}
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={expressionUpdated}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        onSelectChange={onSelectChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-select-answer-option-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={onFocusLinkId}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceSelectAnswerOptionFields
            qItem={qItem}
            options={options}
            valueSelect={valueSelect}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={expressionUpdated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            onSelectChange={onSelectChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceSelectAnswerOptionView;
