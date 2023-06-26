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

import { useContext, useEffect, useMemo, useState } from 'react';
import type { Coding, FhirResource, QuestionnaireItem, ValueSet } from 'fhir/r4';
import {
  getResourceFromLaunchContext,
  getTerminologyServerUrl,
  getValueSetCodings,
  getValueSetPromise
} from '../../valueSet/utils/valueSet.ts';
import { PreprocessedValueSetContext } from '../../../components/Renderer/FormPage/Form.tsx';
import { CachedQueriedValueSetContext } from '../../valueSet/contexts/CachedQueriedValueSetContext.tsx';
import { getAnswerExpression } from '../utils/itemControl.ts';
import { QuestionnaireProviderContext } from '../../../App.tsx';
import { SmartAppLaunchContext } from '../../smartAppLaunch/contexts/SmartAppLaunchContext.tsx';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

function useValueSetCodings(qItem: QuestionnaireItem) {
  const preprocessedCodings = useContext(PreprocessedValueSetContext);
  const { cachedValueSetCodings, addCodingToCache } = useContext(CachedQueriedValueSetContext);
  const { patient, user, encounter } = useContext(SmartAppLaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const launchContexts = questionnaireProvider.launchContexts;
  const variablesXFhirQuery = questionnaireProvider.variables.xFhirQueryVariables;

  const valueSetUrl = qItem.answerValueSet;
  let initialCodings = useMemo(() => {
    // set options from cached answer options if present
    if (valueSetUrl) {
      let cleanValueSetUrl = valueSetUrl;
      if (valueSetUrl.startsWith('#')) {
        cleanValueSetUrl = valueSetUrl.slice(1);
      }

      // attempt to get codings from value sets preprocessed when loading questionnaire
      if (preprocessedCodings[cleanValueSetUrl]) {
        return preprocessedCodings[cleanValueSetUrl];
      }

      // attempt to get codings from cached queried value sets
      if (cachedValueSetCodings[cleanValueSetUrl]) {
        return cachedValueSetCodings[cleanValueSetUrl];
      }
    }

    return [];
  }, [cachedValueSetCodings, preprocessedCodings, valueSetUrl]);

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
      } else if (variablesXFhirQuery[variable]) {
        const resource = variablesXFhirQuery[variable].result;
        if (resource) {
          contextMap[variable] = resource;
        }
      }

      if (contextMap[variable]) {
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
    variablesXFhirQuery
  ]);

  const [codings, setCodings] = useState<Coding[]>(initialCodings);
  const [serverError, setServerError] = useState<Error | null>(null);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl || codings.length > 0) return;

    const terminologyServer = getTerminologyServerUrl(qItem);
    const promise = getValueSetPromise(valueSetUrl, terminologyServer);
    if (promise) {
      promise
        .then((valueSet: ValueSet) => {
          const codings = getValueSetCodings(valueSet);
          if (codings.length > 0) {
            addCodingToCache(valueSetUrl, codings);
            setCodings(codings);
          }
        })
        .catch((error: Error) => {
          setServerError(error);
        });
    }
  }, [qItem]);

  return { codings, serverError };
}

export default useValueSetCodings;
