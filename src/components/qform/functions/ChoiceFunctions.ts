import {
  Extension,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { isSpecificItemControl } from '../qform-components/QItemFunctions';
import { QItemChoiceControl, QItemChoiceOrientation } from '../FormModel';

export function getChoiceControlType(qItem: QuestionnaireItem) {
  const dropdownOptionsCount = 5;
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return QItemChoiceControl.Autocomplete;
  } else if (isSpecificItemControl(qItem, 'check-box')) {
    return QItemChoiceControl.Checkbox;
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

export function updateQrChoiceCheckboxAnswers(
  changedValue: string,
  answers: QuestionnaireResponseItemAnswer[],
  answerOptions: QuestionnaireItemAnswerOption[],
  qrChoiceCheckbox: QuestionnaireResponseItem
): QuestionnaireResponseItem | null {
  // search for answer item of changedValue from list of answer options
  const newAnswer = findInAnswerOptions(answerOptions, changedValue);
  if (!newAnswer) return null;

  if (answers.length > 0) {
    // check if new answer exists in existing qrAnswers
    let qrAnswers = answers;
    const newAnswerInAnswers = findInAnswerOptions(qrAnswers, changedValue);

    if (newAnswerInAnswers) {
      // remove new answer from qrAnswers
      qrAnswers = qrAnswers.filter(
        (answer) => JSON.stringify(answer) !== JSON.stringify(newAnswerInAnswers)
      );
    } else {
      // add new answer to qrAnswers
      qrAnswers.push(newAnswer);
    }

    return { ...qrChoiceCheckbox, answer: qrAnswers };
  } else {
    // add new value as first answer
    return { ...qrChoiceCheckbox, answer: [newAnswer] };
  }
}

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
