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

import { useEffect, useMemo, useState } from 'react';
import type { Coding, FhirResource, QuestionnaireItem, ValueSet } from 'fhir/r4';
import {
  getCodingsForAnswerValueSet,
  getResourceFromLaunchContext,
  getValueSetCodings,
  getValueSetPromise
} from '../utils/valueSet';
import { getAnswerExpression } from '../utils/getExpressionsFromItem';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { useQuestionnaireStore, useSmartConfigStore, useTerminologyServerStore } from '../stores';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';
import useDynamicValueSetEffect, { getUpdatableValueSetUrl } from './useDynamicValueSetEffect';
import { getItemTerminologyServerToUse } from '../utils/preferredTerminologyServer';

export interface TerminologyError {
  error: Error | null;
  answerValueSet: string;
}

function useValueSetCodings(qItem: QuestionnaireItem): {
  codings: Coding[];
  terminologyError: TerminologyError;
  dynamicCodingsUpdated: boolean;
} {
  const patient = useSmartConfigStore.use.patient();
  const user = useSmartConfigStore.use.user();
  const encounter = useSmartConfigStore.use.encounter();

  const launchContexts = useQuestionnaireStore.use.launchContexts();
  const processedValueSets = useQuestionnaireStore.use.processedValueSets();
  const cachedValueSetCodings = useQuestionnaireStore.use.cachedValueSetCodings();
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();
  const addCodingToCache = useQuestionnaireStore.use.addCodingToCache();
  const { xFhirQueryVariables } = useQuestionnaireStore.use.variables();
  const itemPreferredTerminologyServers =
    useQuestionnaireStore.use.itemPreferredTerminologyServers();

  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  const answerValueSetUrl = qItem.answerValueSet;
  let initialCodings = useMemo(
    () => getCodingsForAnswerValueSet(answerValueSetUrl, cachedValueSetCodings, processedValueSets),
    [cachedValueSetCodings, processedValueSets, answerValueSetUrl]
  );

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
          const evaluated = fhirpath.evaluate({}, answerExpression, contextMap, fhirpath_r4_model, {
            async: false
          });

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
  const [dynamicCodingsUpdated, setDynamicCodingsUpdated] = useState(false);

  const codingsCount = codings.length;
  const terminologyServerUrl = getItemTerminologyServerToUse(
    qItem,
    itemPreferredTerminologyServers,
    defaultTerminologyServerUrl
  );

  // Get options from parameterised/dynamic value sets when the updatableValueSetUrl changes (p-param is updated via fhirpath) or from cqf-expression in _answerValueSet
  useDynamicValueSetEffect(
    qItem,
    terminologyServerUrl,
    processedValueSets,
    cachedValueSetCodings,
    setCodings,
    setDynamicCodingsUpdated,
    setServerError
  );

  // Acts as a fallback - get options from answerValueSet in real-time if it's not pre-processed or cached which is very unlikely
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    // Only proceed if we have a valueSetUrl and no codings are already set
    if (!valueSetUrl || codingsCount > 0) {
      return;
    }

    // Only proceed if updatableValueSetUrl is equal to qItem.answerValueSet
    // If we don't have this check, dynamicValueSetEffect that returns 0 codings are going to fallback-expand against their original qItem.answerValueSet, which is not what we want
    if (getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets) !== valueSetUrl) {
      return;
    }

    const promise = getValueSetPromise(valueSetUrl, terminologyServerUrl);
    if (promise) {
      promise
        .then(async (valueSet: ValueSet) => {
          const newCodings = getValueSetCodings(valueSet);
          addDisplayToCodingArray(newCodings, terminologyServerUrl)
            .then((codingsWithDisplay) => {
              if (codingsWithDisplay.length > 0) {
                addCodingToCache(valueSetUrl, codingsWithDisplay);
                setCodings(codingsWithDisplay);
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
  }, [
    addCodingToCache,
    calculatedExpressions,
    codingsCount,
    processedValueSets,
    qItem,
    terminologyServerUrl
  ]);

  return {
    codings,
    terminologyError: { error: serverError, answerValueSet: answerValueSetUrl ?? '' },
    dynamicCodingsUpdated
  };
}

export default useValueSetCodings;
