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

import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { OpenChoiceItemControl } from '../interfaces/choice.enum';
import { isSpecificItemControl } from './itemControl';
import isEqual from 'lodash.isequal';
import differenceWith from 'lodash.differencewith';

/**
 * Update open choice answer based on open label value
 *
 * @author Sean Fong
 */
export function updateOpenLabelAnswer(
  openLabelChecked: boolean,
  changedOpenLabelValue: string,
  answers: QuestionnaireResponseItemAnswer[],
  options: QuestionnaireItemAnswerOption[],
  oldQrItem: QuestionnaireResponseItem,
  isMultiSelection: boolean,
  answerKey: string | undefined
) {
  // Open label is unchecked, search for open label value and remove it
  if (!openLabelChecked) {
    // In single-selection, return empty array because there can only be one answer
    if (!isMultiSelection) {
      return {
        ...oldQrItem,
        answer: []
      };
    }

    // The rest of the processing is for multi-selection
    // Get the indexes of answers that match the open label value
    const matchedIndexes = answers
      .filter((answer) => answer.valueString === changedOpenLabelValue)
      .map((matched) => answers.indexOf(matched));

    // Only remove the last one if there are multiple matches, in case open label value is same as an option
    if (matchedIndexes.length > 0) {
      const lastMatchedIndex = matchedIndexes[matchedIndexes.length - 1];
      const newAnswers = answers.filter((answer, index) => index !== lastMatchedIndex);

      const newAnswersWithKey = newAnswers.map((answer) => ({ ...answer, id: answerKey }));
      return {
        ...oldQrItem,
        answer: newAnswersWithKey
      };
    }

    // Return oldQrItem if no matches are found
    return oldQrItem;
  }

  // Open label is checked, search for open label value and add it
  const newOpenLabelAnswer: QuestionnaireResponseItemAnswer = {
    valueString: changedOpenLabelValue
  };

  // In single-selection, return only newOpenLabelAnswer in an array because there can only be one answer
  if (!isMultiSelection) {
    return {
      ...oldQrItem,
      answer: [{ ...newOpenLabelAnswer, id: answerKey }]
    };
  }

  const oldOpenLabelAnswer: QuestionnaireResponseItemAnswer | null = getOldOpenLabelAnswer(
    answers,
    options
  );

  // No open label answer exists initially, add newOpenLabelAnswer to answers
  if (!oldOpenLabelAnswer) {
    const answersWithKey = answers.map((answer) => ({ ...answer, id: answerKey }));
    return {
      ...oldQrItem,
      answer: [...answersWithKey, { ...newOpenLabelAnswer, id: answerKey }]
    };
  }

  // Old open label answer equals to new open label answer
  // This should not happen, but return oldQrItem
  if (isEqual(oldOpenLabelAnswer, newOpenLabelAnswer)) {
    return oldQrItem;
  }

  // New open label answer is different from old open label answer, update it
  oldOpenLabelAnswer.valueString = changedOpenLabelValue;
  return {
    ...oldQrItem,
    answer: oldQrItem.answer
  };
}

/**
 * Get the old open label answer from the list of answers
 *
 * @author Sean Fong
 */
export function getOldOpenLabelAnswer(
  answers: QuestionnaireResponseItemAnswer[],
  options: QuestionnaireItemAnswerOption[]
): QuestionnaireResponseItemAnswer | null {
  const answersWithoutId = answers.map((answer) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = answer;
    return rest as QuestionnaireResponseItemAnswer;
  });

  const outliers = differenceWith(answersWithoutId, options, isEqual);

  return outliers?.[0] ?? null;
}

/**
 * Get openChoice control type from qItem
 * defaults to select if no control code is provided
 *
 * @author Sean Fong
 */
export function getOpenChoiceControlType(qItem: QuestionnaireItem) {
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return OpenChoiceItemControl.Autocomplete;
  } else if (isSpecificItemControl(qItem, 'check-box')) {
    return OpenChoiceItemControl.Checkbox;
  } else if (isSpecificItemControl(qItem, 'radio-button')) {
    return OpenChoiceItemControl.Radio;
  } else {
    return OpenChoiceItemControl.Select;
  }
}

/**
 * Get string label from given answerOption
 *
 * @author Sean Fong
 */
export function getAnswerOptionLabel(option: QuestionnaireItemAnswerOption | string): string {
  if (typeof option === 'string') {
    return option;
  }

  if (option['valueCoding']) {
    return option.valueCoding.display ?? `${option.valueCoding.code}`;
  } else if (option['valueString']) {
    return option.valueString;
  } else if (option['valueInteger']) {
    return option.valueInteger.toString();
  } else {
    return '';
  }
}
