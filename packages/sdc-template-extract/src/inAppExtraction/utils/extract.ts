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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type {
  CustomDebugInfoParameter,
  FetchQuestionnaireCallback,
  FetchQuestionnaireRequestConfig,
  IssuesParameter,
  ReturnParameter
} from '../../SDCExtractQuestionnaireResponseOperation';
import { createInputParameters, extract } from '../../SDCExtractQuestionnaireResponseOperation';
import { createErrorOutcome } from '../../SDCExtractQuestionnaireResponseOperation/utils/operationOutcome';
import type { ExtractResult, InAppExtractOutput, QuestionnaireOrCallback } from '../interfaces';
import {
  objIsTemplateExtractDebugInfo,
  questionnaireOrCallbackIsFetchQuestionnaireResolver,
  questionnaireOrCallbackIsQuestionnaire
} from './typePredicates';
import { Base64 } from 'js-base64';

/**
 * An abstraction layer over the SDC `extract()` function, which implements the `$extract` operation.
 *
 * This utility handles:
 * - Packing of input parameters (e.g., QuestionnaireResponse, Questionnaire, comparison source).
 * - Unpacking of output parameters (e.g., return Bundle, issues, debug info).
 * - Optional fallback handling when a Questionnaire resource is not provided directly.
 *
 * @param questionnaireResponse - The primary `QuestionnaireResponse` to extract data from.
 * @param questionnaireOrCallback - Either a `Questionnaire` resource or a fetch/callback configuration for dynamic retrieval.
 * @param comparisonSourceResponse - An optional `QuestionnaireResponse` used for comparison when extracting. If this is provided, only "modified" items will be extracted.
 *
 * @returns A promise resolving to an `InAppExtractOutput`:
 * - On success: `{ extractSuccess: true, extractResult: { extractedBundle, issues?, debugInfo? } }`
 * - On failure: `{ extractSuccess: false, extractResult: OperationOutcome }`
 */
export async function inAppExtract(
  questionnaireResponse: QuestionnaireResponse,
  questionnaireOrCallback: QuestionnaireOrCallback,
  comparisonSourceResponse: QuestionnaireResponse | null
): Promise<InAppExtractOutput> {
  // Questionnaire resource is provided, create InputParameters with "questionnaire" parameter
  let questionnaire: Questionnaire | undefined;
  if (questionnaireOrCallbackIsQuestionnaire(questionnaireOrCallback)) {
    questionnaire = questionnaireOrCallback;
  }

  // Questionnaire resource not provided, need to pass the callback and config along
  let fetchQuestionnaireCallback: FetchQuestionnaireCallback = () =>
    Promise.resolve({
      message:
        'This is a placeholder result for sdc-template-extract inAppExtract(). This function should not be called if you have provided a Questionnaire resource.'
    });
  let fetchQuestionnaireRequestConfig: FetchQuestionnaireRequestConfig = {
    sourceServerUrl: ''
  };
  if (questionnaireOrCallbackIsFetchQuestionnaireResolver(questionnaireOrCallback)) {
    fetchQuestionnaireCallback = questionnaireOrCallback.fetchQuestionnaireCallback;
    fetchQuestionnaireRequestConfig = questionnaireOrCallback.fetchQuestionnaireRequestConfig;
  }

  const inputParameters = createInputParameters(
    questionnaireResponse,
    questionnaire,
    comparisonSourceResponse ?? undefined
  );

  // Call extract() function from SDCExtractQuestionnaireResponseOperation
  const outputParameters = await extract(
    inputParameters,
    fetchQuestionnaireCallback,
    fetchQuestionnaireRequestConfig
  );

  // outputParameters is OperationOutcome, return it directly
  if (outputParameters.resourceType === 'OperationOutcome') {
    return { extractSuccess: false, extractResult: outputParameters };
  }

  // At this point outputParameters is a Parameters resource
  const returnParameter = outputParameters.parameter.find(
    (param) => param.name === 'return'
  ) as ReturnParameter;
  const issuesParameter = outputParameters.parameter.find((param) => param.name === 'issues') as
    | IssuesParameter
    | undefined;
  const customDebugInfoParameter = outputParameters.parameter.find(
    (param) => param.name === 'debugInfo-custom'
  ) as CustomDebugInfoParameter | undefined;

  // ReturnParameter resource is not a Bundle - should not happen, but handle it gracefully
  if (returnParameter.resource.resourceType !== 'Bundle') {
    console.error(returnParameter.resource);
    return {
      extractSuccess: false,
      extractResult: createErrorOutcome(
        `Expected return parameter to contain a Bundle resource, but got: ${returnParameter.resource.resourceType}.\nSee resource logged above.`
      )
    };
  }

  // Create ExtractResult object
  const extractResult: ExtractResult = {
    extractedBundle: returnParameter.resource,
    issues: null,
    debugInfo: null
  };

  // Handle issuesParameter
  const hasIssues =
    !!issuesParameter?.resource?.issue && issuesParameter?.resource?.issue?.length > 0;
  if (hasIssues) {
    extractResult.issues = issuesParameter.resource;
  }

  // Handle customDebugInfoParameter
  if (customDebugInfoParameter?.valueAttachment.data) {
    const debugInfo = JSON.parse(Base64.decode(customDebugInfoParameter.valueAttachment.data));

    if (objIsTemplateExtractDebugInfo(debugInfo)) {
      extractResult.debugInfo = debugInfo;
    }
  }

  return {
    extractSuccess: true,
    extractResult: extractResult
  };
}
