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
  Coding,
  Extension,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { ChoiceItemControl, ChoiceItemOrientation } from '../interfaces/choice.enum';
import { isSpecificItemControl } from './itemControl';

/**
 * Convert codings to Questionnaire answer options
 *
 * @author Sean Fong
 */
export function convertCodingsToAnswerOptions(codings: Coding[]): QuestionnaireItemAnswerOption[] {
  return codings.map(
    (coding): QuestionnaireItemAnswerOption => ({
      valueCoding: {
        system: coding.system,
        code: coding.code,
        display: coding.display
      }
    })
  );
}

/**
 * Find and return corresponding answerOption based on selected answer in form
 *
 * @author Sean Fong
 */
export function findInAnswerOptions(
  options: QuestionnaireItemAnswerOption[],
  valueInString: string
): QuestionnaireResponseItemAnswer | undefined {
  for (const option of options) {
    if (option.valueCoding) {
      if (valueInString === option.valueCoding.code) {
        return {
          valueCoding: option.valueCoding
        };
      }
    }

    if (option.valueString) {
      if (valueInString === option.valueString) {
        return {
          valueString: option.valueString
        };
      }
    }

    if (option.valueInteger) {
      if (valueInString === option.valueInteger.toString()) {
        return {
          valueInteger: option.valueInteger
        };
      }
    }
  }

  return;
}

/**
 * Compare answer option value with selected value via valueString, valueInteger, or valueCoding.code
 *
 * @author Sean Fong
 */
export function compareAnswerOptionValue(
  option: QuestionnaireItemAnswerOption,
  value: QuestionnaireItemAnswerOption
): boolean {
  if (!value) {
    return false;
  }

  if (value.valueString) {
    return option.valueString === value.valueString;
  }

  if (value.valueInteger) {
    return option.valueInteger === value.valueInteger;
  }

  if (value.valueCoding && value.valueCoding.code) {
    return option.valueCoding?.code === value.valueCoding.code;
  }

  return false;
}

/**
 * Get choice control type based on certain criteria in choice items
 *
 * @author Sean Fong
 */
export function getChoiceControlType(qItem: QuestionnaireItem) {
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return ChoiceItemControl.Autocomplete;
  }

  if (isSpecificItemControl(qItem, 'check-box')) {
    return ChoiceItemControl.Checkbox;
  }

  if (isSpecificItemControl(qItem, 'radio-button')) {
    return ChoiceItemControl.Radio;
  }

  if (isSpecificItemControl(qItem, 'drop-down')) {
    return ChoiceItemControl.Select;
  }

  return ChoiceItemControl.Select;
}

/**
 * Find and return string value from selected answer
 *
 * @author Sean Fong
 */
export function getQrChoiceValue(
  qrChoice: QuestionnaireResponseItem,
  returnNull?: boolean
): string | null {
  if (qrChoice.answer && qrChoice.answer.length > 0) {
    const answer = qrChoice['answer'][0];
    if (answer['valueCoding']) {
      return answer.valueCoding.code ? answer.valueCoding.code : '';
    } else if (answer['valueString'] !== undefined) {
      return answer.valueString;
    } else if (answer['valueInteger']) {
      return answer.valueInteger.toString();
    }
  }

  return returnNull ? null : '';
}

/**
 * Update choice checkbox group answers based on checkbox changes
 *
 * @author Sean Fong
 */
export function updateChoiceCheckboxAnswers(
  changedValue: string,
  answers: QuestionnaireResponseItemAnswer[],
  options: QuestionnaireItemAnswerOption[],
  oldQrItem: QuestionnaireResponseItem,
  isMultiSelection: boolean,
  answerKey: string | undefined
): QuestionnaireResponseItem | null {
  // search for answer item of changedValue from list of answer options
  const newAnswer = findInAnswerOptions(options, changedValue);
  if (!newAnswer) {
    return null;
  }

  // Process multi-selection
  if (isMultiSelection && answers.length > 0) {
    // check and filter if new answer exists in existing qrAnswers
    const updatedAnswers = answers.filter(
      (answer) => JSON.stringify(answer) !== JSON.stringify(newAnswer)
    );

    // new answer is not present in existing answers, so we add it to the array
    if (updatedAnswers.length === answers.length) {
      updatedAnswers.push(newAnswer);
    }

    const updatedAnswersWithKey = updatedAnswers.map((answer) => ({ ...answer, id: answerKey }));

    return { ...oldQrItem, answer: updatedAnswersWithKey };
  }

  // Process single selection
  // If answer already exists, remove it from the array. Otherwise, add it to the array
  const answerExists = answers.some(
    (answer) => JSON.stringify(answer) === JSON.stringify(newAnswer)
  );
  return answerExists
    ? { ...oldQrItem, answer: [] }
    : { ...oldQrItem, answer: [{ ...newAnswer, id: answerKey }] };
}

/**
 * Get choice orientation from its itemControl
 *
 * @author Sean Fong
 */
export function getChoiceOrientation(qItem: QuestionnaireItem): ChoiceItemOrientation | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation'
  );

  if (itemControl) {
    const code = itemControl.valueCode;
    if (code) {
      if (code === 'horizontal') {
        return ChoiceItemOrientation.Horizontal;
      } else if (code === 'vertical') {
        return ChoiceItemOrientation.Vertical;
      }
    }
  }

  return null;
}
