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

import { OpenChoiceItemControl } from '../../../interfaces/choice.enum';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { getOpenChoiceControlType } from '../../../utils/openChoice';
import OpenChoiceAutocompleteItem from './OpenChoiceAutocompleteItem';
import OpenChoiceCheckboxAnswerOptionItem from './OpenChoiceCheckboxAnswerOptionItem';
import OpenChoiceCheckboxAnswerValueSetItem from './OpenChoiceCheckboxAnswerValueSetItem';
import OpenChoiceRadioAnswerOptionItem from './OpenChoiceRadioAnswerOptionItem';
import OpenChoiceRadioAnswerValueSetItem from './OpenChoiceRadioAnswerValueSetItem';
import OpenChoiceSelectAnswerOptionItem from './OpenChoiceSelectAnswerOptionItem';
import OpenChoiceSelectAnswerValueSetItem from './OpenChoiceSelectAnswerValueSetItem';

function OpenChoiceItemSwitcher(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    calcExpUpdated,
    onQrItemChange
  } = props;

  switch (getOpenChoiceControlType(qItem)) {
    case OpenChoiceItemControl.Checkbox:
      if (qItem.answerValueSet) {
        return (
          <OpenChoiceCheckboxAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={qItem.repeats ?? false}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <OpenChoiceCheckboxAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={qItem.repeats ?? false}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case OpenChoiceItemControl.Radio:
      if (qItem.answerValueSet) {
        return (
          <OpenChoiceRadioAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={qItem.repeats ?? false}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <OpenChoiceRadioAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={qItem.repeats ?? false}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case OpenChoiceItemControl.Autocomplete:
      return (
        <OpenChoiceAutocompleteItem
          qItem={qItem}
          qrItem={qrItem}
          itemPath={itemPath}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
        />
      );
    case OpenChoiceItemControl.Select:
      if (qItem.answerValueSet) {
        return (
          <OpenChoiceSelectAnswerValueSetItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={isRepeated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <OpenChoiceSelectAnswerOptionItem
            qItem={qItem}
            qrItem={qrItem}
            itemPath={itemPath}
            isRepeated={isRepeated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return null;
  }
}

export default OpenChoiceItemSwitcher;
