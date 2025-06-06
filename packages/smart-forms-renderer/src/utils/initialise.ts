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
import { getFirstVisiblePage } from './page';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemInitial,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { Tabs } from '../interfaces/tab.interface';
import type { Pages } from '../interfaces/page.interface';
import { assignPopulatedAnswersToEnableWhen } from './enableWhen';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import { evaluateInitialCalculatedExpressions } from './calculatedExpression';
import { createQuestionnaireResponseItemMap } from './questionnaireResponseStoreUtils/updatableResponseItems';
import { readQuestionnaireResponse } from './genericRecursive';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import { evaluateInitialTargetConstraints } from './targetConstraint';
import type { Variables } from '../interfaces';
import { getRelevantCodingProperties } from './valueSet';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import { evaluateInitialDynamicValueSets } from './parameterisedValueSets';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import { evaluateInitialAnswerOptionsToggleExpressions } from './answerOptionsToggleExpressions';

/**
 * Initialise a questionnaireResponse from a given questionnaire
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
    const initialItems = readQuestionnaireResponse(
      questionnaire,
      questionnaireResponse,
      readInitialValuesRecursive
    );

    if (initialItems && initialItems.length > 0) {
      questionnaireResponse.item = initialItems;
    }
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

function readInitialValuesRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null
): QuestionnaireResponseItem[] | null {
  // Process items with child items
  const initialValues: QuestionnaireResponseItem[] = [];
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    // Process repeating group items separately
    if (qItem.type === 'group' && qItem.repeats) {
      const initialItemsFromRepeatGroup = getInitialValueAnswersFromRepeatGroup(
        qItem,
        qrItemOrItems
      );
      const newRepeatGroupQuestionnaireResponseItem = createNewRepeatGroupQuestionnaireResponseItem(
        qItem,
        initialItemsFromRepeatGroup
      );

      return newRepeatGroupQuestionnaireResponseItem
        ? [newRepeatGroupQuestionnaireResponseItem]
        : null;
    }

    // Map qrItemOrItems into an array of qrItems
    let childQrItems: QuestionnaireResponseItem[] = [];
    if (qrItemOrItems) {
      if (Array.isArray(qrItemOrItems)) {
        childQrItems = qrItemOrItems;
      } else {
        childQrItems = qrItemOrItems.item ?? [];
      }
    }

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      const childInitialValues = readInitialValuesRecursive(childQItem, childQRItemOrItems ?? null);

      if (childInitialValues) {
        initialValues.push(...childInitialValues);
      }
    }
  }

  // Create new qrItem for items with initial values
  let qrItem = createNewQuestionnaireResponseItem(qItem, getInitialValueAnswers(qItem));

  if (initialValues.length > 0) {
    if (!qrItem) {
      qrItem = {
        linkId: qItem.linkId,
        text: qItem.text
      };
    }
    qrItem.item = initialValues;
  }

  return qrItem ? [qrItem] : null;
}

function getInitialValueAnswersFromRepeatGroup(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null
) {
  if (!qItem.item) {
    return [];
  }

  return qItem.item
    .flatMap((childQItem) => readInitialValuesRecursive(childQItem, qrItemOrItems))
    .filter((childQRItem): childQRItem is QuestionnaireResponseItem => !!childQRItem);
}

function getInitialValueAnswers(qItem: QuestionnaireItem): QuestionnaireResponseItemAnswer[] {
  // For answerOption.initialSelected
  if (qItem.type === 'choice' && qItem.answerOption) {
    return qItem.answerOption
      .filter((option) => option.initialSelected)
      .map((option): QuestionnaireResponseItemAnswer | null => {
        if (option.valueCoding) {
          return {
            valueCoding: getRelevantCodingProperties(option.valueCoding)
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
    .map((initialValue) => parseItemInitialToAnswer(initialValue))
    .filter((item): item is QuestionnaireResponseItemAnswer => item !== null);
}

export function parseItemInitialToAnswer(
  initial: QuestionnaireItemInitial
): QuestionnaireResponseItemAnswer | null {
  if (typeof initial.valueBoolean === 'boolean') {
    return { valueBoolean: initial.valueBoolean };
  }

  if (typeof initial.valueDecimal === 'number') {
    return { valueDecimal: initial.valueDecimal };
  }

  if (typeof initial.valueInteger === 'number') {
    return { valueInteger: initial.valueInteger };
  }

  if (typeof initial.valueDate === 'string') {
    return { valueDate: initial.valueDate };
  }

  if (typeof initial.valueDateTime === 'string') {
    return { valueDateTime: initial.valueDateTime };
  }

  if (typeof initial.valueTime === 'string') {
    return { valueTime: initial.valueTime };
  }

  if (typeof initial.valueString === 'string') {
    return { valueString: initial.valueString };
  }

  if (typeof initial.valueUri === 'string') {
    return { valueUri: initial.valueUri };
  }

  if (initial.valueAttachment) {
    return { valueAttachment: initial.valueAttachment };
  }

  if (initial.valueCoding) {
    return { valueCoding: getRelevantCodingProperties(initial.valueCoding) };
  }

  if (initial.valueQuantity) {
    return { valueQuantity: initial.valueQuantity };
  }

  if (initial.valueReference) {
    return { valueReference: initial.valueReference };
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
  sourceQuestionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  targetConstraints: Record<string, TargetConstraint>;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  variables: Variables;
  processedValueSets: Record<string, ProcessedValueSet>;
  tabs: Tabs;
  pages: Pages;
  fhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  terminologyServerUrl: string;
}

export async function initialiseFormFromResponse(params: initialFormFromResponseParams): Promise<{
  initialTargetConstraints: Record<string, TargetConstraint>;
  initialEnableWhenItems: EnableWhenItems;
  initialEnableWhenLinkedQuestions: Record<string, string[]>;
  initialEnableWhenExpressions: EnableWhenExpressions;
  initialCalculatedExpressions: Record<string, CalculatedExpression[]>;
  initialAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  initialProcessedValueSets: Record<string, ProcessedValueSet>;
  firstVisibleTab: number;
  firstVisiblePage: number;
  updatedFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
}> {
  const {
    sourceQuestionnaire,
    questionnaireResponse,
    targetConstraints,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    answerOptionsToggleExpressions,
    variables,
    processedValueSets,
    tabs,
    pages,
    fhirPathContext,
    terminologyServerUrl
  } = params;
  let { fhirPathTerminologyCache } = params;

  const initialResponseItemMap = createQuestionnaireResponseItemMap(
    sourceQuestionnaire,
    questionnaireResponse
  );
  let updatedFhirPathContext = {};

  const { initialisedItems, linkedQuestions } = assignPopulatedAnswersToEnableWhen(
    enableWhenItems,
    questionnaireResponse
  );

  // Initialise target constraints
  const evaluateInitialTargetConstraintsResult = await evaluateInitialTargetConstraints({
    initialResponse: questionnaireResponse,
    initialResponseItemMap: initialResponseItemMap,
    targetConstraints: targetConstraints,
    variables: variables,
    existingFhirPathContext: fhirPathContext,
    fhirPathTerminologyCache: fhirPathTerminologyCache,
    terminologyServerUrl
  });
  const { initialTargetConstraints } = evaluateInitialTargetConstraintsResult;
  fhirPathTerminologyCache = evaluateInitialTargetConstraintsResult.fhirPathTerminologyCache;

  // Initialise answerOptionsToggleExpressions
  const evaluateInitialAnswerOptionsToggleExpressionsResult =
    await evaluateInitialAnswerOptionsToggleExpressions({
      initialResponse: questionnaireResponse,
      initialResponseItemMap: initialResponseItemMap,
      answerOptionsToggleExpressions: answerOptionsToggleExpressions,
      variables: variables,
      existingFhirPathContext: fhirPathContext,
      fhirPathTerminologyCache: fhirPathTerminologyCache,
      terminologyServerUrl
    });
  const { initialAnswerOptionsToggleExpressions } =
    evaluateInitialAnswerOptionsToggleExpressionsResult;
  fhirPathTerminologyCache =
    evaluateInitialAnswerOptionsToggleExpressionsResult.fhirPathTerminologyCache;

  // Initialise dynamicValueSets
  const evaluateInitialDynamicValueSetsResult = await evaluateInitialDynamicValueSets({
    initialResponse: questionnaireResponse,
    initialResponseItemMap: initialResponseItemMap,
    processedValueSets: processedValueSets,
    variables: variables,
    existingFhirPathContext: fhirPathContext,
    fhirPathTerminologyCache: fhirPathTerminologyCache,
    terminologyServerUrl
  });
  const { initialProcessedValueSets } = evaluateInitialDynamicValueSetsResult;
  fhirPathTerminologyCache = evaluateInitialDynamicValueSetsResult.fhirPathTerminologyCache;

  // Initialise enableWhenExpressions
  const evaluateInitialEnableWhenExpressionsResult = await evaluateInitialEnableWhenExpressions({
    initialResponse: questionnaireResponse,
    initialResponseItemMap: initialResponseItemMap,
    enableWhenExpressions: enableWhenExpressions,
    variables: variables,
    existingFhirPathContext: fhirPathContext,
    fhirPathTerminologyCache: fhirPathTerminologyCache,
    terminologyServerUrl: terminologyServerUrl
  });
  const { initialEnableWhenExpressions } = evaluateInitialEnableWhenExpressionsResult;
  fhirPathTerminologyCache = evaluateInitialEnableWhenExpressionsResult.fhirPathTerminologyCache;

  // Initialise calculatedExpressions
  const evaluateInitialCalculatedExpressionsResult = await evaluateInitialCalculatedExpressions({
    initialResponse: questionnaireResponse,
    initialResponseItemMap: initialResponseItemMap,
    calculatedExpressions: calculatedExpressions,
    variables: variables,
    existingFhirPathContext: fhirPathContext,
    fhirPathTerminologyCache: fhirPathTerminologyCache,
    terminologyServerUrl
  });
  const { initialCalculatedExpressions } = evaluateInitialCalculatedExpressionsResult;
  updatedFhirPathContext = evaluateInitialEnableWhenExpressionsResult.updatedFhirPathContext;

  const firstVisibleTab =
    Object.keys(tabs).length > 0
      ? getFirstVisibleTab(tabs, initialisedItems, initialEnableWhenExpressions)
      : 0;

  const firstVisiblePage =
    Object.keys(pages).length > 0
      ? getFirstVisiblePage(pages, initialisedItems, initialEnableWhenExpressions)
      : 0;

  return {
    initialTargetConstraints,
    initialEnableWhenItems: initialisedItems,
    initialEnableWhenLinkedQuestions: linkedQuestions,
    initialEnableWhenExpressions,
    initialCalculatedExpressions,
    initialAnswerOptionsToggleExpressions,
    initialProcessedValueSets,
    firstVisibleTab,
    firstVisiblePage,
    updatedFhirPathContext,
    fhirPathTerminologyCache
  };
}
