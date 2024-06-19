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

import { DynamicValueSet } from '../interfaces/valueSet.interface';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import cloneDeep from 'lodash.clonedeep';
import _isEqual from 'lodash/isEqual';

export function evaluateDynamicValueSets(
  fhirPathContext: Record<string, any>,
  dynamicValueSets: Record<string, DynamicValueSet>
): {
  dynamicValueSetsIsUpdated: boolean;
  updatedDynamicValueSets: Record<string, DynamicValueSet>;
} {
  const updatedDynamicValueSets: Record<string, DynamicValueSet> = cloneDeep(dynamicValueSets);

  let isUpdated = false;
  for (const linkId in updatedDynamicValueSets) {
    const dynamicValueSet = updatedDynamicValueSets[linkId];
    const completeResource = dynamicValueSet.sourceResource;
    const valueSetComposeInclude = completeResource.compose?.include;
    if (valueSetComposeInclude && valueSetComposeInclude.length > 0) {
      for (const include of valueSetComposeInclude) {
        if (!include.filter) {
          continue;
        }

        // There are filters present, check for fhirpath embeddings
        const fhirPathEmbeddingsMap: Record<string, string> = {};
        for (const filter of include.filter) {
          const filterValue = filter.value;
          if (filterValue.includes('{{') && filterValue.includes('}}')) {
            if (filterValue) {
              for (const embedding of readFhirPathEmbeddingsFromStr(filterValue)) {
                if (embedding) {
                  fhirPathEmbeddingsMap[embedding] = '';
                }
              }
            }
          }
        }

        const evaluatedFhirPathEmbeddingsMap = evaluateFhirPathEmbeddings(
          fhirPathEmbeddingsMap,
          fhirPathContext
        );

        const evaluatedFhirPathEmbeddingsTuple = Object.entries(
          evaluatedFhirPathEmbeddingsMap
        ).filter(([, value]) => value != '');

        for (const filter of include.filter) {
          evaluatedFhirPathEmbeddingsTuple.forEach(([embedding, value]) => {
            const filterValue = filter.value;
            const pattern = new RegExp(`{{%${embedding}}}`, 'g');
            filter.value = filterValue.replace(pattern, value);
          });
        }
      }
    }

    // Complete resource has been updated, update the dynamicValueSet object
    if (!_isEqual(dynamicValueSets[linkId].completeResource, completeResource)) {
      isUpdated = true;

      // If source response same as the complete resource, embeddings are not replaced, therefore ValueSet is not complete
      updatedDynamicValueSets[linkId] = {
        sourceResource: dynamicValueSets[linkId].sourceResource,
        completeResource: dynamicValueSet.sourceResource,
        version: dynamicValueSet.version + 1,
        isComplete: !_isEqual(dynamicValueSets[linkId].sourceResource, completeResource)
      };
    }
  }

  // after that we need to update the dynamicvalueset object - iscomplete so that we can use it in useMemo - or potentially updated the version of the dynamic updatedcount

  return {
    dynamicValueSetsIsUpdated: isUpdated,
    updatedDynamicValueSets: updatedDynamicValueSets
  };
}

function evaluateFhirPathEmbeddings(
  fhirPathEmbeddingsMap: Record<string, any>,
  fhirPathContext: Record<string, any>
) {
  // evaluate fhirpath embeddings within map
  Object.keys(fhirPathEmbeddingsMap).forEach((embedding) => {
    try {
      const result = fhirpath.evaluate({}, `%${embedding}`, fhirPathContext, fhirpath_r4_model)[0];

      if (result !== undefined && result !== null) {
        fhirPathEmbeddingsMap[embedding] = result;
      }
    } catch (e) {
      console.warn(e);
    }
  });

  return fhirPathEmbeddingsMap;
}

const FHIRPATH_EMBEDDING_REGEX = /{{%(.*?)}}/g;

function readFhirPathEmbeddingsFromStr(expression: string): string[] {
  return [...expression.matchAll(FHIRPATH_EMBEDDING_REGEX)].map((match) => match[1] ?? '');
}
