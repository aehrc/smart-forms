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

import type {
  InputParameters,
  ReferenceContext,
  ResourceContext
} from '../interfaces/inputParameters.interface';
import { isContextParameter } from './typePredicates';
import fhirpath from 'fhirpath';
import type { Bundle, FhirResource, OperationOutcomeIssue, Questionnaire } from 'fhir/r4';
import { createWarningIssue } from './operationOutcome';
import type { FetchResourceCallback } from '../interfaces';

export async function createFhirPathContext(
  parameters: InputParameters,
  questionnaire: Questionnaire,
  fetchResourceCallback: FetchResourceCallback,
  requestConfig: any,
  issues: OperationOutcomeIssue[]
): Promise<Record<string, any>> {
  const { launchContexts, updatedReferenceContexts, updatedContainedBatchContexts } =
    replaceFhirPathEmbeddings(parameters, questionnaire);

  const contextMap: Record<string, any> = {};

  // Add launch contexts and contained batch contexts to contextMap
  for (const launchContext of launchContexts) {
    contextMap[launchContext.part[0].valueString] = launchContext.part[1].resource;
  }

  for (const containedBatchContext of updatedContainedBatchContexts) {
    contextMap[containedBatchContext.part[0].valueString] = containedBatchContext.part[1].resource;
  }

  // Get promises from context references
  let referenceContextsTuple: [ReferenceContext, Promise<any>, FhirResource | null][] =
    updatedReferenceContexts.map((referenceContext) => {
      const query = referenceContext.part[1]?.valueReference?.reference;

      // assert non-null as we have filtered the referenceContexts array previously
      return [referenceContext, fetchResourceCallback(query!, requestConfig), null];
    });

  // Resolve promises
  try {
    const promises: Promise<any>[] = referenceContextsTuple.map(([, promise]) => promise);
    const responses = await Promise.all(promises);

    const resources = responses.map((response) => response.data as FhirResource);
    referenceContextsTuple = referenceContextsTuple.map((tuple, i) => {
      const [referenceContext, promise] = tuple;
      return [referenceContext, promise, resources[i] ?? null];
    });
  } catch (e) {
    if (e instanceof Error) {
      issues.push(createWarningIssue(e.message));
    }
  }

  // Add bundles from reference contexts to contextMap
  for (const tuple of referenceContextsTuple) {
    const [referenceContext, , resource] = tuple;
    if (!resource) {
      issues.push(
        createWarningIssue(
          `The reference from context ${referenceContext.part[0]?.name} cannot be resolved.`
        )
      );
      continue;
    }

    if (resource.resourceType === 'OperationOutcome') {
      issues.push(...resource.issue);
      continue;
    }

    const contextName = referenceContext.part[0].valueString;
    if (contextName) {
      contextMap[contextName] = resource;
    }
  }

  return contextMap;
}

function replaceFhirPathEmbeddings(
  parameters: InputParameters,
  questionnaire: Questionnaire
): {
  launchContexts: ResourceContext[];
  updatedReferenceContexts: ReferenceContext[];
  updatedContainedBatchContexts: ResourceContext[];
} {
  const launchContexts = parameters.parameter.filter(
    (param) => isContextParameter(param) && param.part && !!param.part[1].resource
  ) as ResourceContext[];

  const referenceContexts = parameters.parameter.filter(
    (param) => isContextParameter(param) && param.part && !!param.part[1].valueReference?.reference
  ) as ReferenceContext[];

  // Get and transform context references which references contained batchs into a separate array
  const containedBatchContexts: ResourceContext[] = getContainedBatchContexts(
    referenceContexts,
    questionnaire
  );

  if (launchContexts.length > 0) {
    // Get and store fhirpath embeddings from reference contexts and contained batch contexts into a map
    const fhirPathEmbeddingsMap = getFhirPathEmbeddings(referenceContexts, containedBatchContexts);

    // evaluate fhirpath embeddings with values from launch context map
    const evaluatedFhirPathEmbeddingsMap = evaluateFhirPathEmbeddings(
      fhirPathEmbeddingsMap,
      launchContexts
    );

    // Replace fhirpath embeddings with evaluated values
    const { updatedReferenceContexts, updatedContainedBatchContexts } =
      replaceEvaluatedFhirPathEmbeddingsInContexts(
        evaluatedFhirPathEmbeddingsMap,
        referenceContexts,
        containedBatchContexts
      );

    return { launchContexts, updatedReferenceContexts, updatedContainedBatchContexts };
  } else {
    return {
      launchContexts,
      updatedReferenceContexts: referenceContexts,
      updatedContainedBatchContexts: containedBatchContexts
    };
  }
}

function getContainedBatchContexts(
  referenceContexts: ReferenceContext[],
  questionnaire: Questionnaire
): ResourceContext[] {
  const containedBatchContexts: ResourceContext[] = [];
  const containedResources = questionnaire.contained;
  for (const referenceContext of referenceContexts) {
    const reference = referenceContext.part[1].valueReference.reference;
    if (
      reference &&
      reference.startsWith('#') &&
      containedResources &&
      containedResources.length > 0
    ) {
      const containedReference = reference.slice(1);
      const batch = containedResources.find(
        (resource) => resource.id === containedReference && resource.resourceType === 'Bundle'
      ) as Bundle | undefined;

      if (batch && batch.entry && batch.id) {
        containedBatchContexts.push({
          name: 'context',
          part: [
            {
              name: 'name',
              valueString: referenceContext.part[0].valueString
            },
            {
              name: 'content',
              resource: batch
            }
          ]
        });
      }
    }
  }

  return containedBatchContexts;
}

function getFhirPathEmbeddings(
  referenceContexts: ReferenceContext[],
  containedBatchContexts: ResourceContext[]
): Record<string, string> {
  const fhirPathEmbeddingsMap: Record<string, string> = {};

  // Identify and store fhirpath embeddings from referenceContexts and containedBatchContexts in a map
  for (const referenceContext of referenceContexts) {
    const reference = referenceContext.part[1].valueReference.reference;
    if (reference) {
      const fhirPathEmbeddings = readFhirPathEmbeddingsFromStr(reference);
      for (const embedding of fhirPathEmbeddings) {
        if (embedding) {
          fhirPathEmbeddingsMap[embedding] = '';
        }
      }
    }
  }

  for (const containedBatchContext of containedBatchContexts) {
    const batch = containedBatchContext.part[1].resource;
    if (batch.resourceType === 'Bundle' && batch.entry && batch.entry.length > 0) {
      for (const entry of batch.entry) {
        if (entry.request?.url) {
          const fhirPathEmbeddings = readFhirPathEmbeddingsFromStr(entry.request.url);
          for (const embedding of fhirPathEmbeddings) {
            if (embedding) {
              fhirPathEmbeddingsMap[embedding] = '';
            }
          }
        }
      }
    }
  }

  return fhirPathEmbeddingsMap;
}

function evaluateFhirPathEmbeddings(
  fhirPathEmbeddingsMap: Record<string, string>,
  launchContexts: ResourceContext[]
) {
  // transform launch contexts to launch context map
  const launchContextMap: Record<string, FhirResource> = {};
  for (const launchContext of launchContexts) {
    launchContextMap[launchContext.part[0].valueString] = launchContext.part[1].resource;
  }

  // evaluate fhirpath embeddings within map
  Object.keys(fhirPathEmbeddingsMap).forEach((embedding) => {
    const contextName = embedding.split('.')[0];
    const fhirPathQuery = embedding.split('.').slice(1).join('.');

    if (contextName) {
      try {
        fhirPathEmbeddingsMap[embedding] = fhirpath.evaluate(
          launchContextMap[contextName],
          fhirPathQuery
        )[0];
      } catch (e) {
        console.warn(e);
      }
    }
  });

  return fhirPathEmbeddingsMap;
}

function replaceEvaluatedFhirPathEmbeddingsInContexts(
  evaluatedFhirPathEmbeddingsMap: Record<string, string>,
  referenceContexts: ReferenceContext[],
  containedBatchContexts: ResourceContext[]
): {
  updatedReferenceContexts: ReferenceContext[];
  updatedContainedBatchContexts: ResourceContext[];
} {
  const evaluatedFhirPathEmbeddingsTuple = Object.entries(evaluatedFhirPathEmbeddingsMap);

  // Replace fhirpath embeddings with evaluated values
  referenceContexts.forEach((referenceContext) => {
    evaluatedFhirPathEmbeddingsTuple.forEach(([embedding, value]) => {
      // Create a regex pattern to match the variable name within curly braces
      const pattern = new RegExp(`{{%${embedding}}}`, 'g');

      // Replace occurrences of the variable name with its value
      if (referenceContext.part[1].valueReference.reference) {
        referenceContext.part[1].valueReference.reference =
          referenceContext.part[1].valueReference.reference.replace(pattern, value);
      }
    });
  });

  // Remove reference contexts which references contained resources
  const filteredReferenceContexts = referenceContexts.filter(
    (referenceContext) =>
      referenceContext.part[1].valueReference.reference &&
      !referenceContext.part[1].valueReference.reference.startsWith('#')
  );

  containedBatchContexts.forEach((containedBatchContext) => {
    const batch = containedBatchContext.part[1].resource;
    if (batch.resourceType === 'Bundle' && batch.entry && batch.entry.length > 0) {
      for (const entry of batch.entry) {
        evaluatedFhirPathEmbeddingsTuple.forEach(([embedding, value]) => {
          // Create a regex pattern to match the variable name within curly braces
          const pattern = new RegExp(`{{%${embedding}}}`, 'g');

          if (entry.request?.url) {
            entry.request.url = entry.request.url.replace(pattern, value);
          }
        });
      }
    }
  });

  return {
    updatedReferenceContexts: filteredReferenceContexts,
    updatedContainedBatchContexts: containedBatchContexts
  };
}

const FHIRPATH_EMBEDDING_REGEX = /{{%(.*?)}}/g;

function readFhirPathEmbeddingsFromStr(expression: string): string[] {
  return [...expression.matchAll(FHIRPATH_EMBEDDING_REGEX)].map((match) => match[1] ?? '');
}
