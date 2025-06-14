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
import { ChoiceItemControl } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import ChoiceRadioAnswerOptionItem from './ChoiceRadioAnswerOptionItem';
import ChoiceSelectAnswerOptionItem from './ChoiceSelectAnswerOptionItem';
import ChoiceCheckboxAnswerOptionItem from './ChoiceCheckboxAnswerOptionItem';
import ChoiceAutocompleteItem from './ChoiceAutocompleteItem';
import ChoiceSelectAnswerValueSetItem from './ChoiceSelectAnswerValueSetItem';
import { getChoiceControlType } from '../../../utils/choice';
import ChoiceRadioAnswerValueSetItem from './ChoiceRadioAnswerValueSetItem';
import ChoiceCheckboxAnswerValueSetItem from './ChoiceCheckboxAnswerValueSetItem';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import Typography from '@mui/material/Typography';

interface ChoiceItemSwitcherProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceItemSwitcher(props: ChoiceItemSwitcherProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    isTabled,
    renderingExtensions,
    showMinimalView,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const choiceControlType = getChoiceControlType(qItem);

  switch (choiceControlType) {
    case ChoiceItemControl.Radio:
      if (qItem.answerOption) {
        return (
          <ChoiceRadioAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={isRepeated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <ChoiceRadioAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={isRepeated}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case ChoiceItemControl.Checkbox:
      if (qItem.answerOption) {
        return (
          <ChoiceCheckboxAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={qItem.repeats ?? false}
            renderingExtensions={renderingExtensions}
            showMinimalView={showMinimalView}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <ChoiceCheckboxAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={qItem.repeats ?? false}
            renderingExtensions={renderingExtensions}
            showMinimalView={showMinimalView}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case ChoiceItemControl.Autocomplete:
      return (
        <ChoiceAutocompleteItem
          qItem={qItem}
          qrItem={qrItem}
          itemPath={itemPath}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          onQrItemChange={onQrItemChange}
        />
      );
    case ChoiceItemControl.Select:
      if (qItem.answerOption) {
        return (
          <ChoiceSelectAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={isRepeated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <ChoiceSelectAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={isRepeated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return (
        <Typography component="div">
          Something has went wrong when parsing item {qItem.linkId} - {qItem.text}
        </Typography>
      );
  }
}

export default ChoiceItemSwitcher;
