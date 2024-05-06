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

import { evaluateInitialEnableWhenExpressions } from './enableWhenExpression';
import { getFirstVisibleTab } from './tabs';
import type {
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemInitial,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces';
import type { Tabs } from '../interfaces/tab.interface';
import { assignPopulatedAnswersToEnableWhen } from './enableWhen';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import { evaluateInitialCalculatedExpressions } from './calculatedExpression';
import { createQuestionnaireResponseItemMap } from './questionnaireResponseStoreUtils/updatableResponseItems';

/**
 * Initialise a conformant questionnaireResponse from a given questionnaire
 * optionally takes in an existing questionnaireResponse to be initialised
 *
 * @author Sean Fong
 */
export function initialiseQuestionnaireResponse(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse
) {
  if (!questionnaireResponse) {
    questionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress'
    };
  }

  if (!questionnaireResponse.status) {
    questionnaireResponse.status = 'in-progress';
  }

  const firstTopLevelItem = questionnaire?.item?.[0];
  if (firstTopLevelItem && !questionnaireResponse.item) {
    const initialItems = readItemInitialValues(questionnaire);

    questionnaireResponse.item =
      initialItems && initialItems.length > 0
        ? initialItems
        : [
            {
              linkId: firstTopLevelItem.linkId,
              text: firstTopLevelItem.text,
              item: []
            }
          ];
  }

  if (!questionnaireResponse.questionnaire) {
    questionnaireResponse.questionnaire = createQuestionnaireReference(questionnaire);
  }

  // Add "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaireresponse" profile
  // const profiles: string[] = [
  //   'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaireresponse'
  // ];
  // questionnaireResponse.meta = questionnaireResponse.meta || {};
  // questionnaireResponse.meta.profile = profiles;

  return questionnaireResponse;
}

function createQuestionnaireReference(questionnaire: Questionnaire) {
  // Use {url}|{version}
  if (questionnaire.url) {
    let questionnaireReference = questionnaire.url;
    if (questionnaire.version) {
      questionnaireReference += '|' + questionnaire.version;
    }
    return questionnaireReference;
  }

  // If no url exists, use Questionnaire/{id}
  if (questionnaire.id) {
    return `Questionnaire/${questionnaire.id}`;
  }

  return '';
}

function readItemInitialValues(questionnaire: Questionnaire) {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return null;
  }

  const topLevelQrItems: QuestionnaireResponseItem[] = [];
  for (const topLevelQItem of questionnaire.item) {
    const updatedTopLevelQRItem = readItemInitialValueRecursive(topLevelQItem);

    if (Array.isArray(updatedTopLevelQRItem)) {
      if (updatedTopLevelQRItem.length > 0) {
        topLevelQrItems.push(...updatedTopLevelQRItem);
      }
      continue;
    }

    if (updatedTopLevelQRItem) {
      topLevelQrItems.push(updatedTopLevelQRItem);
    }
  }

  if (topLevelQrItems.length === 0) {
    return null;
  }

  return topLevelQrItems;
}

function readItemInitialValueRecursive(
  qItem: QuestionnaireItem
): QuestionnaireResponseItem[] | QuestionnaireResponseItem | null {
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    // TODO No support for multiple rows at the moment
    if (qItem.type === 'group' && qItem.repeats) {
      const initialItemsFromRepeatGroup = getInitialValueAnswersFromRepeatGroup(qItem);
      return createNewRepeatGroupQuestionnaireResponseItem(qItem, initialItemsFromRepeatGroup);
    }

    const initialQRItems: QuestionnaireResponseItem[] = [];
    for (const childQItem of childQItems) {
      const initialChildQRItemOrItems = readItemInitialValueRecursive(childQItem);

      if (Array.isArray(initialChildQRItemOrItems)) {
        if (initialChildQRItemOrItems.length > 0) {
          initialQRItems.push(...initialChildQRItemOrItems);
        }
        continue;
      }

      if (initialChildQRItemOrItems) {
        initialQRItems.push(initialChildQRItemOrItems);
      }
    }

    let qrItem = createNewQuestionnaireResponseItem(qItem, getInitialValueAnswers(qItem));

    if (initialQRItems.length > 0) {
      if (!qrItem) {
        qrItem = {
          linkId: qItem.linkId,
          text: qItem.text
        };
      }
      qrItem.item = initialQRItems;
    }

    return qrItem;
  }

  return createNewQuestionnaireResponseItem(qItem, getInitialValueAnswers(qItem));
}

function getInitialValueAnswers(qItem: QuestionnaireItem): QuestionnaireResponseItemAnswer[] {
  // For answerOption.initialSelected
  if (qItem.type === 'choice' && qItem.answerOption) {
    return qItem.answerOption
      .filter((option) => option.initialSelected)
      .map((option): QuestionnaireResponseItemAnswer | null => {
        if (option.valueCoding) {
          return {
            valueCoding: option.valueCoding
          };
        }

        if (option.valueString) {
          return {
            valueString: option.valueString
          };
        }

        if (option.valueInteger) {
          return {
            valueInteger: option.valueInteger
          };
        }

        return null;
      })
      .filter((item): item is QuestionnaireResponseItemAnswer => !!item);
  }

  // For item.initial
  const initialValues = qItem.initial;
  if (!initialValues) {
    return [];
  }

  return initialValues
    .map((initialValue) => initialValueSwitcher(initialValue))
    .filter((item): item is QuestionnaireResponseItemAnswer => item !== null);
}

function getInitialValueAnswersFromRepeatGroup(qItem: QuestionnaireItem) {
  if (!qItem.item) {
    return [];
  }

  return qItem.item
    .map((childQItem): QuestionnaireResponseItem => {
      return {
        linkId: childQItem.linkId,
        ...(childQItem.text ? { text: childQItem.text } : {}),
        answer: getInitialValueAnswers(childQItem)
      };
    })
    .filter((childQRItem) => childQRItem.answer && childQRItem.answer.length > 0);
}

function initialValueSwitcher(
  initialValue: QuestionnaireItemInitial
): QuestionnaireResponseItemAnswer | null {
  if (initialValue.valueBoolean) {
    return { valueBoolean: initialValue.valueBoolean };
  }

  if (initialValue.valueDecimal) {
    return { valueDecimal: initialValue.valueDecimal };
  }

  if (initialValue.valueInteger) {
    return { valueInteger: initialValue.valueInteger };
  }

  if (initialValue.valueDate) {
    return { valueDate: initialValue.valueDate };
  }

  if (initialValue.valueDateTime) {
    return { valueDateTime: initialValue.valueDateTime };
  }

  if (initialValue.valueTime) {
    return { valueTime: initialValue.valueTime };
  }

  if (initialValue.valueString) {
    return { valueString: initialValue.valueString };
  }

  if (initialValue.valueUri) {
    return { valueUri: initialValue.valueUri };
  }

  if (initialValue.valueAttachment) {
    return { valueAttachment: initialValue.valueAttachment };
  }

  if (initialValue.valueCoding) {
    return { valueCoding: initialValue.valueCoding };
  }

  if (initialValue.valueQuantity) {
    return { valueQuantity: initialValue.valueQuantity };
  }

  if (initialValue.valueReference) {
    return { valueReference: initialValue.valueReference };
  }

  return null;
}

function createNewQuestionnaireResponseItem(
  qItem: QuestionnaireItem,
  initialValueAnswers: QuestionnaireResponseItemAnswer[]
): QuestionnaireResponseItem | null {
  if (initialValueAnswers.length === 0) {
    return null;
  }

  // If item is non-repeating, only take the first initial value
  if (!qItem.repeats) {
    initialValueAnswers = [initialValueAnswers[0]];
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: initialValueAnswers
  };
}

function createNewRepeatGroupQuestionnaireResponseItem(
  qItem: QuestionnaireItem,
  initialValueItems: QuestionnaireResponseItem[]
): QuestionnaireResponseItem | null {
  if (initialValueItems.length === 0) {
    return null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    item: initialValueItems
  };
}

export interface initialFormFromResponseParams {
  questionnaireResponse: QuestionnaireResponse;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  variablesFhirPath: Record<string, Expression[]>;
  tabs: Tabs;
  fhirPathContext: Record<string, any>;
}

export function initialiseFormFromResponse(params: initialFormFromResponseParams): {
  initialEnableWhenItems: EnableWhenItems;
  initialEnableWhenLinkedQuestions: Record<string, string[]>;
  initialEnableWhenExpressions: EnableWhenExpressions;
  initialCalculatedExpressions: Record<string, CalculatedExpression[]>;
  firstVisibleTab: number;
  updatedFhirPathContext: Record<string, any>;
} {
  const {
    questionnaireResponse,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    variablesFhirPath,
    tabs
  } = params;
  const initialResponseItemMap = createQuestionnaireResponseItemMap(questionnaireResponse);
  let updatedFhirPathContext = params.fhirPathContext;

  const { initialisedItems, linkedQuestions } = assignPopulatedAnswersToEnableWhen(
    enableWhenItems,
    questionnaireResponse
  );

  const evaluateInitialEnableWhenExpressionsResult = evaluateInitialEnableWhenExpressions({
    initialResponse: questionnaireResponse,
    initialResponseItemMap: initialResponseItemMap,
    enableWhenExpressions: enableWhenExpressions,
    variablesFhirPath: variablesFhirPath
  });
  const { initialEnableWhenExpressions } = evaluateInitialEnableWhenExpressionsResult;
  updatedFhirPathContext = evaluateInitialEnableWhenExpressionsResult.updatedFhirPathContext;

  const evaluateInitialCalculatedExpressionsResult = evaluateInitialCalculatedExpressions({
    initialResponse: questionnaireResponse,
    initialResponseItemMap: initialResponseItemMap,
    calculatedExpressions: calculatedExpressions,
    variablesFhirPath: variablesFhirPath,
    existingFhirPathContext: updatedFhirPathContext
  });
  const { initialCalculatedExpressions } = evaluateInitialCalculatedExpressionsResult;
  updatedFhirPathContext = evaluateInitialEnableWhenExpressionsResult.updatedFhirPathContext;

  const firstVisibleTab =
    Object.keys(tabs).length > 0
      ? getFirstVisibleTab(tabs, initialisedItems, initialEnableWhenExpressions)
      : 0;

  return {
    initialEnableWhenItems: initialisedItems,
    initialEnableWhenLinkedQuestions: linkedQuestions,
    initialEnableWhenExpressions,
    initialCalculatedExpressions,
    firstVisibleTab,
    updatedFhirPathContext
  };
}
