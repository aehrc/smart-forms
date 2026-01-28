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

import type {
  InputParameters,
  ReferenceContext,
  ResourceContext
} from '../interfaces/inputParameters.interface';
import { isContextParameter } from './typePredicates';
import fhirpath from 'fhirpath';
// Need to specifically import from 'index.js' to get it working with ts
import fhirpath_r4_model from 'fhirpath/fhir-context/r4/index.js';
import type {
  Bundle,
  Expression,
  Extension,
  FhirResource,
  OperationOutcomeIssue,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r4';
import type {
  FetchResourceCallback,
  FetchResourceRequestConfig,
  FetchTerminologyRequestConfig
} from '../interfaces';
import { createInvalidWarningIssue, createNotFoundWarningIssue } from './operationOutcome';
import { TERMINOLOGY_SERVER_URL } from '../../globals';
import { emptyResponse } from './emptyResource';
import { createReferenceContextTuple, createResourceContextTuple } from './createContextTuples';

/**
 * Creates a comprehensive FHIRPath evaluation context for questionnaire population operations.
 * This context includes launch contexts, resolved FHIR resources, and evaluated variables that can be referenced
 * in FHIRPath expressions throughout the questionnaire. It handles both direct resource contexts and reference-based
 * contexts that need to be fetched from external FHIR servers during the population process.
 */
export async function createFhirPathContext(
  parameters: InputParameters,
  questionnaire: Questionnaire,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  issues: OperationOutcomeIssue[],
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): Promise<Record<string, any>> {
  const { launchContexts, updatedReferenceContexts, updatedContainedBatchContexts } =
    await replaceFhirPathEmbeddings(parameters, questionnaire, fetchTerminologyRequestConfig, fetchResourceRequestConfig);

  const fhirPathContext: Record<string, any> = {
    resource: structuredClone(emptyResponse),
    rootResource: structuredClone(emptyResponse)
  };

  // Add launch contexts and contained batch contexts to contextMap
  for (const launchContext of launchContexts) {
    fhirPathContext[launchContext.part[0].valueString] = launchContext.part[1].resource;
  }

  for (const containedBatchContext of updatedContainedBatchContexts) {
    fhirPathContext[containedBatchContext.part[0].valueString] =
      containedBatchContext.part[1].resource;
  }

  // Resolve and populate reference context resources into contextMap
  await populateReferenceContextsIntoContextMap(
    updatedReferenceContexts,
    fhirPathContext,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    issues
  );

  // Resolve and populate contained batch resources into contextMap
  await populateBatchContextsIntoContextMap(
    updatedContainedBatchContexts,
    fhirPathContext,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    issues
  );

  // Extract and evaluate FHIRPath variables
  await extractAndEvaluateFhirPathVariables(
    questionnaire,
    fhirPathContext,
    issues,
    fetchTerminologyRequestConfig,
    fetchResourceRequestConfig
  );

  return fhirPathContext;
}

/**
 * Extracts and evaluates all FHIRPath variables defined in a questionnaire at both questionnaire and item levels.
 * FHIRPath variables allow questionnaires to define reusable expressions that can be referenced throughout
 * the form using %variableName syntax. This function processes variable extensions and makes their evaluated
 * results available in the FHIRPath context for use in other expressions like initialExpression or calculatedExpression.
 */
export async function extractAndEvaluateFhirPathVariables(
  questionnaire: Questionnaire,
  fhirPathContext: Record<string, any>,
  issues: OperationOutcomeIssue[],
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig,
  fetchResourceRequestConfig?: FetchResourceRequestConfig
) {
  if (!questionnaire.extension || questionnaire.extension.length === 0) {
    return;
  }

  // Extract and evaluate FHIRPath variables from questionnaire-level
  const questionnaireLevelVariables = getFhirPathVariables(questionnaire.extension);
  await evaluateFhirPathVariables(
    questionnaireLevelVariables,
    fhirPathContext,
    issues,
    fetchTerminologyRequestConfig,
    fetchResourceRequestConfig
  );

  // Extract and evaluate FHIRPath variables from item-level
  let itemLevelVariables: Record<string, any> = {};
  itemLevelVariables = extractItemLevelFhirPathVariables(questionnaire, itemLevelVariables);
  if (Object.keys(itemLevelVariables).length > 0) {
    for (const [, variables] of Object.entries(itemLevelVariables)) {
      await evaluateFhirPathVariables(
        variables,
        fhirPathContext,
        issues,
        fetchTerminologyRequestConfig,
        fetchResourceRequestConfig
      );
    }
  }
}

/**
 * Recursively extracts FHIRPath variable definitions from questionnaire items at all nesting levels.
 * This function traverses the questionnaire's hierarchical structure to find variable extensions defined
 * on individual items, which allows for item-specific variables that can be used in expressions within
 * that item's scope or by other items that reference them.
 */
export function extractItemLevelFhirPathVariables(
  questionnaire: Questionnaire,
  variables: Record<string, Expression[]>
): Record<string, Expression[]> {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return variables;
  }

  for (const topLevelItem of questionnaire.item) {
    const isRepeatGroup = !!topLevelItem.repeats && topLevelItem.type === 'group';
    extractItemLevelFhirPathVariablesRecursive({
      item: topLevelItem,
      variables,
      parentRepeatGroupLinkId: isRepeatGroup ? topLevelItem.linkId : undefined
    });
  }

  return variables;
}

interface ExtractItemLevelFhirPathVariablesRecursiveParams {
  item: QuestionnaireItem;
  variables: Record<string, Expression[]>;
  parentRepeatGroupLinkId?: string;
}

/**
 * Recursively processes a single questionnaire item and its children to extract FHIRPath variable definitions.
 * This helper function handles the recursive traversal logic for extractItemLevelFhirPathVariables,
 * properly tracking parent repeat group context and ensuring variables are extracted from all
 * nested items regardless of the questionnaire's structural complexity.
 */
export function extractItemLevelFhirPathVariablesRecursive(
  params: ExtractItemLevelFhirPathVariablesRecursiveParams
) {
  const { item, variables, parentRepeatGroupLinkId } = params;

  const items = item.item;
  const isRepeatGroup = !!item.repeats && item.type === 'group';
  if (items && items.length > 0) {
    // iterate through items of item recursively
    for (const childItem of items) {
      extractItemLevelFhirPathVariablesRecursive({
        ...params,
        item: childItem,
        parentRepeatGroupLinkId: isRepeatGroup ? item.linkId : parentRepeatGroupLinkId
      });
    }
  }

  if (item.extension) {
    variables[item.linkId] = getFhirPathVariables(item.extension);
  }

  return {
    variables
  };
}

/**
 * Evaluates an array of FHIRPath variable expressions and adds their results to the FHIRPath context.
 * Each variable's expression is evaluated against the current context and the result is stored
 * using the variable's name, making it available for reference in other FHIRPath expressions
 * throughout the questionnaire using %variableName syntax.
 */
export async function evaluateFhirPathVariables(
  variables: Expression[],
  fhirPathContext: Record<string, any>,
  issues: OperationOutcomeIssue[],
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig,
  fetchResourceRequestConfig?: FetchResourceRequestConfig
) {
  if (variables.length === 0) {
    return;
  }

  const terminologyServerUrl = fetchTerminologyRequestConfig?.terminologyServerUrl ?? null;
  const fhirServerUrl = fetchResourceRequestConfig?.sourceServerUrl ?? null;

  for (const variable of variables) {
    if (variable.expression) {
      try {
        const fhirPathResult = fhirpath.evaluate(
          {},
          variable.expression,
          fhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl ?? TERMINOLOGY_SERVER_URL,
            ...(fhirServerUrl && { fhirServerUrl })
          }
        );

        fhirPathContext[`${variable.name}`] = await handleFhirPathResult(fhirPathResult);
      } catch (e) {
        // e is not thrown as an Error type in fhirpath.js, so we can't use `if (e instanceof Error)` here
        console.warn(
          `SDC-Populate Error: fhirpath evaluation for Questionnaire-level FHIRPath variable ${variable.expression} failed. Details below:` +
            e
        );
        issues.push(createInvalidWarningIssue(String(e)));
      }
    }
  }
}

/**
 * Get fhirpath variables from an array of extensions
 */
export function getFhirPathVariables(extensions: Extension[]): Expression[] {
  return (
    extensions
      .filter(
        (extension) =>
          extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
          extension.valueExpression?.language === 'text/fhirpath'
      )
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((extension) => extension.valueExpression!)
  );
}

/**
 * Resolves reference-based context parameters by fetching the actual FHIR resources they point to.
 * Reference contexts contain URLs or references to FHIR resources that need to be retrieved from
 * external servers before they can be used in FHIRPath expressions. This function handles the
 * asynchronous fetching process and populates the context map with the resolved resources.
 */
export async function populateReferenceContextsIntoContextMap(
  referenceContexts: ReferenceContext[],
  contextMap: Record<string, any>,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  issues: OperationOutcomeIssue[]
) {
  // Get promises from context references
  let referenceContextTuples = referenceContexts.map((referenceContext) =>
    createReferenceContextTuple(referenceContext, fetchResourceCallback, fetchResourceRequestConfig)
  );

  try {
    // Resolve promises for referenceContextsTuple
    const promises: Promise<any>[] = referenceContextTuples.map(([, promise]) => promise);
    const settledPromises = await Promise.allSettled(promises);
    const resources: (FhirResource | null)[] = settledPromises.map((settledPromise) => {
      if (settledPromise.status === 'rejected') {
        return null;
      }

      let resource: FhirResource | null = null;

      // Get lookupResult from response (fhirClient and fetch scenario)
      if (responseDataIsFhirResource(settledPromise.value)) {
        resource = settledPromise.value;
      }
      // Fallback to get valueSet from response.data (axios scenario)
      if (
        !resource &&
        settledPromise.value.data &&
        responseDataIsFhirResource(settledPromise.value.data)
      ) {
        resource = settledPromise.value.data;
      }

      return resource;
    });

    // Update referenceContextTuples with resolved resources
    referenceContextTuples = referenceContextTuples.map((tuple, i) => {
      const [referenceContext, promise] = tuple;
      return [referenceContext, promise, resources[i] ?? null];
    });
  } catch (e) {
    if (e instanceof Error) {
      issues.push(createInvalidWarningIssue(e.message));
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
        createNotFoundWarningIssue(
          `The reference ${referenceContext.part[1]?.valueReference.reference} from context ${referenceContext.part[0]?.valueString} cannot be resolved`
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

/**
 * Processes batch context bundles by fetching the individual resources referenced in batch entries.
 * Batch contexts contain FHIR Bundle resources with batch-type entries that specify multiple resources
 * to be fetched. This function executes the batch requests and populates each bundle entry with
 * the corresponding fetched resource data for use in FHIRPath expressions.
 */
export async function populateBatchContextsIntoContextMap(
  batchContexts: ResourceContext[],
  contextMap: Record<string, any>,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
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
      createResourceContextTuple(
        batchContext,
        entry,
        fetchResourceCallback,
        fetchResourceRequestConfig
      )
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
      const settledPromises = await Promise.allSettled(promises);
      const resources: (FhirResource | null)[] = settledPromises.map((settledPromise) => {
        if (settledPromise.status === 'rejected') {
          return null;
        }

        const response = settledPromise.value;
        if (responseDataIsFhirResource(response?.data)) {
          return response.data as FhirResource;
        }

        return null;
      });

      // Add resources to batch bundle
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const entry = batchBundle.entry[i];

        // If resource or entry is null, add a warning issue
        if (!resource || !entry) {
          issues.push(
            createNotFoundWarningIssue(
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
      issues.push(createInvalidWarningIssue(e.message));
    }
  }
}

/**
 * Type guard function to determine if response data represents a valid FHIR resource.
 * This function checks for the presence and type of the resourceType property which is
 * required for all FHIR resources. It's used to validate responses from FHIR servers
 * before attempting to process them as FHIR resources in the population context.
 */
export function responseDataIsFhirResource(responseData: any): responseData is FhirResource {
  return !!(
    responseData &&
    responseData.resourceType &&
    typeof responseData.resourceType === 'string'
  );
}

/**
 * Processes and evaluates FHIRPath embeddings found in context references and batch contexts.
 * FHIRPath embeddings use {{%expression}} syntax within URLs and references to create dynamic
 * values based on launch context data. This function identifies these embeddings, evaluates them
 * against available launch contexts, and replaces them with their computed values.
 */
export async function replaceFhirPathEmbeddings(
  parameters: InputParameters,
  questionnaire: Questionnaire,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig,
  fetchResourceRequestConfig?: FetchResourceRequestConfig
): Promise<{
  launchContexts: ResourceContext[];
  updatedReferenceContexts: ReferenceContext[];
  updatedContainedBatchContexts: ResourceContext[];
}> {
  const launchContexts = parameters.parameter.filter(
    (param) =>
      isContextParameter(param) &&
      param.part &&
      !!param.part[1].resource &&
      param.part[1].resource?.resourceType !== 'Bundle'
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
    const evaluatedFhirPathEmbeddingsMap = await evaluateFhirPathEmbeddings(
      fhirPathEmbeddingsMap,
      launchContexts,
      fetchTerminologyRequestConfig,
      fetchResourceRequestConfig
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

/**
 * Extracts contained batch Bundle resources from reference contexts that point to questionnaire.contained resources.
 * When reference contexts use '#' prefixed references, they point to resources contained within the questionnaire
 * itself rather than external resources. This function identifies these contained batch bundles and converts
 * them into resource contexts for processing during population.
 */
export function getContainedBatchContexts(
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

/**
 * Scans reference contexts and batch contexts to identify all FHIRPath embeddings that need evaluation.
 * FHIRPath embeddings use {{%expression}} syntax and are commonly found in URLs and references
 * where dynamic values from launch contexts need to be substituted. This function creates a map
 * of all unique embeddings found across all contexts for subsequent evaluation.
 */
export function getFhirPathEmbeddings(
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

/**
 * Evaluates FHIRPath embeddings against launch context data to produce concrete values for substitution.
 * Each embedding expression is evaluated using the appropriate launch context resource as the root,
 * allowing dynamic references like {{%patient.id}} to be resolved to actual patient IDs from
 * the launch context for use in URLs and resource references.
 */
export async function evaluateFhirPathEmbeddings(
  fhirPathEmbeddingsMap: Record<string, string>,
  launchContexts: ResourceContext[],
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig,
  fetchResourceRequestConfig?: FetchResourceRequestConfig
) {
  const terminologyServerUrl = fetchTerminologyRequestConfig?.terminologyServerUrl ?? null;
  const fhirServerUrl = fetchResourceRequestConfig?.sourceServerUrl ?? null;

  // transform launch contexts to launch context map
  const launchContextMap: Record<string, FhirResource> = {};
  for (const launchContext of launchContexts) {
    launchContextMap[launchContext.part[0].valueString] = launchContext.part[1].resource;
  }

  // evaluate fhirpath embeddings within map
  for (const embedding of Object.keys(fhirPathEmbeddingsMap)) {
    const contextName = embedding.split('.')[0];
    const fhirPathQuery = embedding.split('.').slice(1).join('.');

    if (contextName) {
      try {
        const fhirPathResult = fhirpath.evaluate(launchContextMap[contextName], fhirPathQuery, {
          async: true,
          terminologyUrl: terminologyServerUrl ?? TERMINOLOGY_SERVER_URL,
          ...(fhirServerUrl && { fhirServerUrl })
        });
        fhirPathEmbeddingsMap[embedding] = (await handleFhirPathResult(fhirPathResult))[0];
      } catch (e) {
        console.warn('SDC-Populate Error: Evaluate fhirpath embeddings failed. Details below:' + e);
      }
    }
  }

  return fhirPathEmbeddingsMap;
}

/**
 * Replaces FHIRPath embeddings with their evaluated values throughout reference and batch contexts.
 * After embeddings have been evaluated, this function performs string replacement to substitute
 * all {{%expression}} patterns with their computed values in URLs, references, and other string
 * fields where dynamic content was specified using FHIRPath embedding syntax.
 */
export function replaceEvaluatedFhirPathEmbeddingsInContexts(
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

/**
 * Extracts FHIRPath embedding expressions from strings using regex pattern matching.
 * FHIRPath embeddings are enclosed in {{%...}} syntax within strings and this function
 * uses a regex pattern to find all such expressions and extract just the FHIRPath expression
 * part for evaluation, enabling dynamic content substitution in URLs and references.
 */
export function readFhirPathEmbeddingsFromStr(expression: string): string[] {
  return [...expression.matchAll(FHIRPATH_EMBEDDING_REGEX)].map((match) => match[1] ?? '');
}

/**
 * Handles both synchronous and asynchronous FHIRPath evaluation results uniformly.
 * FHIRPath evaluation can return either direct results or promises depending on whether
 * async operations like terminology lookups are involved. This function provides a consistent
 * interface for handling both cases and ensuring all results are properly awaited when needed.
 */
export async function handleFhirPathResult(result: any[] | Promise<any[]>) {
  if (result instanceof Promise) {
    return await result;
  }

  return result;
}
