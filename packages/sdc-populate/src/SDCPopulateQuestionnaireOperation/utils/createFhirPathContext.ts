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
import type {
  Bundle,
  BundleEntry,
  FhirResource,
  OperationOutcomeIssue,
  Questionnaire
} from 'fhir/r4';
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

  // Resolve and populate reference context resources into contextMap
  await populateReferenceContextsIntoContextMap(
    updatedReferenceContexts,
    contextMap,
    fetchResourceCallback,
    requestConfig,
    issues
  );

  // Resolve and populate contained batch resources into contextMap
  await populateBatchContextsIntoContextMap(
    updatedContainedBatchContexts,
    contextMap,
    fetchResourceCallback,
    requestConfig,
    issues
  );

  return contextMap;
}

async function populateReferenceContextsIntoContextMap(
  referenceContexts: ReferenceContext[],
  contextMap: Record<string, any>,
  fetchResourceCallback: FetchResourceCallback,
  requestConfig: any,
  issues: OperationOutcomeIssue[]
) {
  // Get promises from context references
  let referenceContextTuples = referenceContexts.map((referenceContext) =>
    createReferenceContextTuple(referenceContext, fetchResourceCallback, requestConfig)
  );

  try {
    // Resolve promises for referenceContextsTuple
    const promises: Promise<any>[] = referenceContextTuples.map(([, promise]) => promise);
    const responses = await Promise.all(promises);
    const resources: (FhirResource | null)[] = responses.map((response) =>
      responseDataIsFhirResource(response?.data) ? (response.data as FhirResource) : null
    );

    // Update referenceContextTuples with resolved resources
    referenceContextTuples = referenceContextTuples.map((tuple, i) => {
      const [referenceContext, promise] = tuple;
      return [referenceContext, promise, resources[i] ?? null];
    });
  } catch (e) {
    if (e instanceof Error) {
      issues.push(createWarningIssue(e.message));
    }
  }

  // Add resources to contextMap
  for (let i = 0; i < referenceContextTuples.length; i++) {
    const referenceContextTuple = referenceContextTuples[i];
    if (!referenceContextTuple) {
      continue;
    }

    const referenceContext = referenceContextTuple[0];
    const resource = referenceContextTuple[2];
    if (!resource) {
      issues.push(
        createWarningIssue(
          `The reference from context ${referenceContext.part[0]?.name} cannot be resolved.`
        )
      );
      continue;
    }

    // If resource is an OperationOutcome, add to issues array
    if (resource.resourceType === 'OperationOutcome') {
      issues.push(...resource.issue);
      continue;
    }

    // Add resource to contextMap
    const contextName = referenceContext.part[0].valueString;
    if (contextName) {
      contextMap[contextName] = resource;
    }
  }
}

async function populateBatchContextsIntoContextMap(
  batchContexts: ResourceContext[],
  contextMap: Record<string, any>,
  fetchResourceCallback: FetchResourceCallback,
  requestConfig: any,
  issues: OperationOutcomeIssue[]
) {
  // Get promises from contained batch contexts
  const batchContextTuples: [ResourceContext, Promise<any>, FhirResource | null][][] = [];
  for (const batchContext of batchContexts) {
    const batchBundle = batchContext.part[1].resource as Bundle;
    // batch bundle empty
    if (!batchBundle.entry || batchBundle.entry.length === 0) {
      batchContextTuples.push([]);
      continue;
    }

    // batch bundle contains entries, create a request for each entry
    const batchContextEntryTuples = batchBundle.entry.map((entry) =>
      createResourceContextTuple(batchContext, entry, fetchResourceCallback, requestConfig)
    );

    batchContextTuples.push(batchContextEntryTuples);
  }

  // Resolve promises for batchContextsTuples and add populated batch bundles to contextMap
  try {
    for (const batchContextEntryTuples of batchContextTuples) {
      if (!batchContextEntryTuples[0]) {
        continue;
      }

      // Ensure batch bundle is available
      const resourceContext = batchContextEntryTuples[0][0];
      const batchBundleName = resourceContext.part[0].valueString;
      const batchBundle = resourceContext.part[1].resource as Bundle;
      if (!batchBundle.entry || batchBundle.entry.length === 0) {
        continue;
      }

      // Resolve promises for batchContextEntryTuples
      const promises: Promise<any>[] = batchContextEntryTuples.map(([, promise]) => promise);
      const responses = await Promise.all(promises);
      const resources: (FhirResource | null)[] = responses.map((response) =>
        responseDataIsFhirResource(response?.data) ? (response.data as FhirResource) : null
      );

      // Add resources to batch bundle
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const entry = batchBundle.entry[i];

        // If resource or entry is null, add a warning issue
        if (!resource || !entry) {
          issues.push(
            createWarningIssue(
              `The resource for ${batchBundleName} entry ${i} could not be resolved.`
            )
          );
          continue;
        }

        // If resource is an OperationOutcome, add issues to issues array
        if (resource.resourceType === 'OperationOutcome') {
          issues.push(...resource.issue);
          continue;
        }

        // Add resource to batch bundle entry
        entry.resource = resource;
      }

      // Add batch bundle to contextMap
      contextMap[batchBundleName] = batchBundle;
    }
  } catch (e) {
    if (e instanceof Error) {
      issues.push(createWarningIssue(e.message));
    }
  }
}

function responseDataIsFhirResource(responseData: any): responseData is FhirResource {
  return responseData && responseData.resourceType && typeof responseData.resourceType === 'string';
}

function createReferenceContextTuple(
  referenceContext: ReferenceContext,
  fetchResourceCallback: FetchResourceCallback,
  requestConfig: any
): [ReferenceContext, Promise<any>, FhirResource | null] {
  const query = referenceContext.part[1]?.valueReference?.reference;

  if (!query) {
    return [
      referenceContext,
      Promise.resolve(
        createWarningIssue(
          `Reference Context ${referenceContext.part[0]?.valueString ?? ''} does not contain a reference`
        )
      ),
      null
    ];
  }

  return [referenceContext, fetchResourceCallback(query, requestConfig), null];
}

function createResourceContextTuple(
  resourceContext: ResourceContext,
  bundleEntry: BundleEntry<FhirResource>,
  fetchResourceCallback: FetchResourceCallback,
  requestConfig: any
): [ResourceContext, Promise<any>, FhirResource | null] {
  const query = bundleEntry.request?.url;

  if (!query) {
    const resourceContextName = resourceContext.part[0]?.valueString;
    return [
      resourceContext,
      Promise.resolve(
        createWarningIssue(
          `${resourceContextName} bundle entry ${bundleEntry.fullUrl ?? ''} does not contain a request`
        )
      ),
      null
    ];
  }

  return [resourceContext, fetchResourceCallback(query, requestConfig), null];
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
