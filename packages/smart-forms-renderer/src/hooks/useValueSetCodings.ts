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

import { useEffect, useMemo, useState } from 'react';
import type { Coding, FhirResource, QuestionnaireItem, ValueSet } from 'fhir/r4';
import {
  getResourceFromLaunchContext,
  getTerminologyServerUrl,
  getValueSetCodings,
  getValueSetPromise
} from '../utils/valueSet';
import { getAnswerExpression } from '../utils/getExpressionsFromItem';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { useQuestionnaireStore, useSmartConfigStore, useTerminologyServerStore } from '../stores';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';

export interface TerminologyError {
  error: Error | null;
  answerValueSet: string;
}

function useValueSetCodings(qItem: QuestionnaireItem): {
  codings: Coding[];
  terminologyError: TerminologyError;
} {
  const patient = useSmartConfigStore.use.patient();
  const user = useSmartConfigStore.use.user();
  const encounter = useSmartConfigStore.use.encounter();

  const launchContexts = useQuestionnaireStore.use.launchContexts();
  const processedValueSetCodings = useQuestionnaireStore.use.processedValueSetCodings();
  const cachedValueSetCodings = useQuestionnaireStore.use.cachedValueSetCodings();
  const addCodingToCache = useQuestionnaireStore.use.addCodingToCache();
  const { xFhirQueryVariables } = useQuestionnaireStore.use.variables();
  const itemPreferredTerminologyServers =
    useQuestionnaireStore.use.itemPreferredTerminologyServers();

  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  const valueSetUrl = qItem.answerValueSet;
  let initialCodings = useMemo(() => {
    // set options from cached answer options if present
    if (valueSetUrl) {
      let cleanValueSetUrl = valueSetUrl;
      if (valueSetUrl.startsWith('#')) {
        cleanValueSetUrl = valueSetUrl.slice(1);
      }

      // attempt to get codings from value sets preprocessed when loading questionnaire
      if (processedValueSetCodings[cleanValueSetUrl]) {
        return processedValueSetCodings[cleanValueSetUrl];
      }

      // attempt to get codings from cached queried value sets
      if (cachedValueSetCodings[cleanValueSetUrl]) {
        return cachedValueSetCodings[cleanValueSetUrl];
      }
    }

    return [];
  }, [cachedValueSetCodings, processedValueSetCodings, valueSetUrl]);

  // Attempt to get codings from answer expression
  const answerExpression = getAnswerExpression(qItem)?.expression;
  initialCodings = useMemo(() => {
    if (initialCodings.length === 0 && answerExpression) {
      const variable = answerExpression.substring(
        answerExpression.indexOf('%') + 1,
        answerExpression.indexOf('.')
      );
      const contextMap: Record<string, FhirResource> = {};

      // get answer expression resource from launch contexts
      if (launchContexts[variable]) {
        const resourceType = launchContexts[variable].extension[1].valueCode;
        const resource = getResourceFromLaunchContext(resourceType, patient, user, encounter);
        if (resource) {
          contextMap[variable] = resource;
        }
      } else if (xFhirQueryVariables[variable]) {
        const resource = xFhirQueryVariables[variable].result;
        if (resource) {
          contextMap[variable] = resource;
        }
      }

      if (contextMap[variable]) {
        try {
          const evaluated: any[] = fhirpath.evaluate(
            {},
            answerExpression,
            contextMap,
            fhirpath_r4_model
          );

          if (evaluated[0].system || evaluated[0].code) {
            // determine if the evaluated array is a coding array
            return evaluated;
          } else if (evaluated[0].coding) {
            // determine and return if the evaluated array is a codeable concept
            return evaluated[0].coding;
          }
        } catch (e) {
          console.warn(e.message);
        }
      }
    }

    return initialCodings;
  }, [
    answerExpression,
    encounter,
    initialCodings,
    launchContexts,
    patient,
    user,
    xFhirQueryVariables
  ]);

  const [codings, setCodings] = useState<Coding[]>(initialCodings);
  const [serverError, setServerError] = useState<Error | null>(null);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl || codings.length > 0) return;

    const preferredTerminologyServerUrl = itemPreferredTerminologyServers[qItem.linkId];
    const terminologyServerUrl =
      getTerminologyServerUrl(qItem) ??
      preferredTerminologyServerUrl ??
      defaultTerminologyServerUrl;
    const promise = getValueSetPromise(valueSetUrl, terminologyServerUrl);
    if (promise) {
      promise
        .then(async (valueSet: ValueSet) => {
          const codings = getValueSetCodings(valueSet);
          addDisplayToCodingArray(codings, terminologyServerUrl)
            .then((codingsWithDisplay) => {
              if (codingsWithDisplay.length > 0) {
                addCodingToCache(valueSetUrl, codingsWithDisplay);
                setCodings(codings);
              }
            })
            .catch((error: Error) => {
              setServerError(error);
            });
        })
        .catch((error: Error) => {
          setServerError(error);
        });
    }
  }, [qItem]);

  return { codings, terminologyError: { error: serverError, answerValueSet: valueSetUrl ?? '' } };
}

export default useValueSetCodings;
