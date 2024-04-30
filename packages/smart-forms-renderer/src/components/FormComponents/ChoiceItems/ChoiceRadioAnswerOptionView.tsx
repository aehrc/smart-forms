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
import ChoiceRadioAnswerOptionFields from './ChoiceRadioAnswerOptionFields';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem } from 'fhir/r4';

interface ChoiceRadioAnswerOptionViewProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  valueChoice: string | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onCheckedChange: (linkId: string) => void;
  onFocusLinkId: () => void;
}

function ChoiceRadioAnswerOptionView(props: ChoiceRadioAnswerOptionViewProps) {
  const {
    qItem,
    valueChoice,
    isRepeated,
    isTabled,
    readOnly,
    calcExpUpdated,
    onFocusLinkId,
    onCheckedChange
  } = props;

  if (isRepeated) {
    return (
      <ChoiceRadioAnswerOptionFields
        qItem={qItem}
        valueRadio={valueChoice}
        isTabled={isTabled}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        onCheckedChange={onCheckedChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-radio-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={onFocusLinkId}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceRadioAnswerOptionFields
          qItem={qItem}
          valueRadio={valueChoice}
          readOnly={readOnly}
          isTabled={isTabled}
          calcExpUpdated={calcExpUpdated}
          onCheckedChange={onCheckedChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerOptionView;
