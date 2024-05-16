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
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import ChoiceSelectAnswerOptionFields from './ChoiceSelectAnswerOptionFields';

interface ChoiceSelectAnswerOptionViewProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueChoice: string | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onSelectChange: (linkId: string) => void;
  onFocusLinkId: () => void;
  onClear: () => void;
}

function ChoiceSelectAnswerOptionView(props: ChoiceSelectAnswerOptionViewProps) {
  const {
    qItem,
    options,
    valueChoice,
    isRepeated,
    isTabled,
    readOnly,
    calcExpUpdated,
    onFocusLinkId,
    onSelectChange,
    onClear
  } = props;

  if (isRepeated) {
    return (
      <ChoiceSelectAnswerOptionFields
        qItem={qItem}
        options={options}
        valueSelect={valueChoice ?? ''}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onSelectChange={onSelectChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-select-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={onFocusLinkId}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceSelectAnswerOptionFields
          qItem={qItem}
          options={options}
          valueSelect={valueChoice ?? ''}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onSelectChange={onSelectChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceSelectAnswerOptionView;
