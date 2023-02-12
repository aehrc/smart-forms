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

import {
  Coding,
  Extension,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import {
  CheckBoxOptionType,
  QItemChoiceControl,
  QItemChoiceOrientation
} from '../interfaces/Enums';
import { isSpecificItemControl } from './ItemControlFunctions';

/**
 * Get choice control type based on certain criteria in choice items
 *
 * @author Sean Fong
 */
export function getChoiceControlType(qItem: QuestionnaireItem) {
  const dropdownOptionsCount = 5;
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return QItemChoiceControl.Autocomplete;
  } else if (isSpecificItemControl(qItem, 'check-box')) {
    return QItemChoiceControl.Checkbox;
  } else if (isSpecificItemControl(qItem, 'radio-button')) {
    return QItemChoiceControl.Radio;
  } else {
    if (qItem.answerOption) {
      return qItem.answerOption.length > 0 && qItem.answerOption.length < dropdownOptionsCount
        ? QItemChoiceControl.Radio
        : QItemChoiceControl.Select;
    } else {
      return QItemChoiceControl.Select;
    }
  }
}

/**
 * Find and return corresponding answerOption based on selected answer in form
 *
 * @author Sean Fong
 */
export function findInAnswerOptions(
  answerOptions: QuestionnaireItemAnswerOption[],
  selected: string
): QuestionnaireResponseItemAnswer | undefined {
  for (const option of answerOptions) {
    if (option['valueCoding']) {
      if (selected === option.valueCoding.code) {
        return option;
      }
    } else if (option['valueString']) {
      if (selected === option.valueString) {
        return option;
      }
    } else if (option['valueInteger']) {
      if (selected === option.valueInteger.toString()) {
        return option;
      }
    }
  }
}

/**
 * Find and return corresponding coding from AnswerValyeSet based on selected answer in form
 *
 * @author Sean Fong
 */
export function findInAnswerValueSetCodings(
  codings: Coding[],
  selected: string
): QuestionnaireResponseItemAnswer | undefined {
  for (const coding of codings) {
    if (selected === coding.code) {
      return coding;
    }
  }
}

/**
 * Find and return string value from selected answer
 *
 * @author Sean Fong
 */
export function getQrChoiceValue(qrChoice: QuestionnaireResponseItem): string {
  if (qrChoice['answer']) {
    const answer = qrChoice['answer'][0];
    if (answer['valueCoding']) {
      return answer.valueCoding.code ? answer.valueCoding.code : '';
    } else if (answer['valueString']) {
      return answer.valueString;
    } else if (answer['valueInteger']) {
      return answer.valueInteger.toString();
    }
  }
  return '';
}

/**
 * Update choice checkbox group answers based on checkbox changes
 *
 * @author Sean Fong
 */
export function updateQrCheckboxAnswers(
  changedValue: string,
  answers: QuestionnaireResponseItemAnswer[],
  answerOptions: QuestionnaireItemAnswerOption[],
  qrChoiceCheckbox: QuestionnaireResponseItem,
  checkboxOptionType: CheckBoxOptionType,
  isMultiSelection: boolean
): QuestionnaireResponseItem | null {
  // search for answer item of changedValue from list of answer options
  const newAnswer = findInAnswerOptions(answerOptions, changedValue);
  if (!newAnswer) return null;

  if (isMultiSelection && answers.length > 0) {
    // check and filter if new answer exists in existing qrAnswers
    const updatedAnswers = answers.filter(
      (answer) => JSON.stringify(answer) !== JSON.stringify(newAnswer)
    );

    // new answer is not present in existing answers, so we add it to the array
    if (updatedAnswers.length === answers.length) {
      updatedAnswers.push(newAnswer);
    }

    return { ...qrChoiceCheckbox, answer: updatedAnswers };
  } else {
    return answers.some((answer) => JSON.stringify(answer) === JSON.stringify(newAnswer))
      ? { ...qrChoiceCheckbox, answer: [] }
      : { ...qrChoiceCheckbox, answer: [newAnswer] };
  }
}

/**
 * Get choice orientation from its itemControl
 *
 * @author Sean Fong
 */
export function getChoiceOrientation(qItem: QuestionnaireItem): QItemChoiceOrientation {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation'
  );
  if (itemControl) {
    const code = itemControl.valueCode;
    if (code) {
      if (code === 'horizontal') {
        return QItemChoiceOrientation.Horizontal;
      } else if (code === 'vertical') {
        return QItemChoiceOrientation.Vertical;
      }
    }
  }
  return QItemChoiceOrientation.Vertical;
}

/**
 * Converts an array of codings to an array of valueCodings which can use the QuestionnaireItemAnswerOption type
 *
 * @author Sean Fong
 */
export function mapCodingsToOptions(codings: Coding[]): QuestionnaireItemAnswerOption[] {
  return codings.map((coding) => {
    return {
      valueCoding: coding
    };
  });
}
