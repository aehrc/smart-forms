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
import { initialiseInputParameters } from './inputParameters';
import type { PopulateQuestionnaireParams } from './populateQuestionnaire';
import { createFhirPathContext } from '../../SDCPopulateQuestionnaireOperation/utils/createFhirPathContext';
import { isInputParameters } from '../../SDCPopulateQuestionnaireOperation';

interface SyncXFhirQueriesParams extends PopulateQuestionnaireParams {
  xFhirQueries: string[];
}

/**
 * Evaluates and updates the values of specific x-fhir-query variables within a questionnaire.
 *
 * Unlike full questionnaire population (e.g. via `populateQuestionnaire`), this function focuses solely on resolving a subset of x-fhir-query variables using a provided resource-fetching callback.
 * This is useful for cases where only certain variables need to be updated, when using the custom extension - https://smartforms.csiro.au/ig/StructureDefinition/GranularRepopulateSync
 *
 * Internally, it constructs input parameters and uses the same evaluation logic as full population, but returns only the selected evaluated results.
 * If you need full population, use `populateQuestionnaire` instead.
 *
 * NOTE 04/09/2025: it is unused now, but might come in handy in the future - so not deleting it.
 *
 * @param params - Refer to SyncXFhirQueriesParams interface. Extends PopulateQuestionnaireParams with a list of x-fhir-query variable names to evaluate.
 * @returns A record mapping each successfully evaluated x-fhir-query name to its resolved value, or `null` if input parameters could not be constructed.
 *
 * @author Sean Fong
 */
export async function syncXFhirQueries(
  params: SyncXFhirQueriesParams
): Promise<Record<string, any> | null> {
  const {
    questionnaire,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    patient,
    user,
    encounter,
    fhirContext,
    timeoutMs = 10000,
    xFhirQueries
  } = params;

  const { inputParameters } = await initialiseInputParameters(
    questionnaire,
    patient,
    user ?? null,
    encounter ?? null,
    fhirContext ?? null,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    timeoutMs
  );

  if (!inputParameters || !isInputParameters(inputParameters)) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  // Reuse createFhirPathContext to create a full fhirPath context object
  const fhirPathContext = await createFhirPathContext(
    inputParameters,
    questionnaire,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    []
  );

  const evaluatedQueries: Record<string, any> = {};
  for (const query of xFhirQueries) {
    if (query in fhirPathContext) {
      evaluatedQueries[query] = fhirPathContext[query];
    }
  }

  return evaluatedQueries;
}
