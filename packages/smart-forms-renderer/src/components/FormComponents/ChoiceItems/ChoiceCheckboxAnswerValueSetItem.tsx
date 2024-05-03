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
import { createEmptyQrItem } from '../../../utils/qrItem';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import { mapCodingsToOptions, updateQrCheckboxAnswers } from '../../../utils/choice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import ChoiceCheckboxAnswerValueSetFields from './ChoiceCheckboxAnswerValueSetFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';

interface ChoiceCheckboxAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  showText?: boolean;
}

function ChoiceCheckboxAnswerValueSetItem(props: ChoiceCheckboxAnswerValueSetItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    showMinimalView = false,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const qrChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem);
  const answers = qrChoiceCheckbox.answer ? qrChoiceCheckbox.answer : [];

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Get codings/options from valueSet
  const { codings, terminologyError } = useValueSetCodings(qItem);

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  // Event handlers
  function handleCheckedChange(changedValue: string) {
    if (codings.length < 1) return null;

    const updatedQrChoiceCheckbox = updateQrCheckboxAnswers(
      changedValue,
      answers,
      mapCodingsToOptions(codings),
      qrChoiceCheckbox,
      isRepeated
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  if (showMinimalView) {
    return (
      <>
        <ChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          codings={codings}
          answers={answers}
          readOnly={readOnly}
          terminologyError={terminologyError}
          onCheckedChange={handleCheckedChange}
        />
        <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-checkbox-answer-value-set-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          codings={codings}
          answers={answers}
          readOnly={readOnly}
          terminologyError={terminologyError}
          onCheckedChange={handleCheckedChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceCheckboxAnswerValueSetItem;
