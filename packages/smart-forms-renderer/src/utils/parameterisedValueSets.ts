import type {
  Extension,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import type { BindingParameter, ProcessedValueSet } from '../interfaces/valueSet.interface';
import type { Variables } from '../interfaces';
import {
  cacheTerminologyResult,
  createFhirPathContext,
  handleFhirPathResult,
  isExpressionCached
} from './fhirpath';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { ComputedNewAnswers } from '../interfaces/computedUpdates.interface';

export function getBindingParameter(bindingParamExtension: Extension): BindingParameter | null {
  const paramName = bindingParamExtension.extension?.find((ext) => ext.url === 'name')?.valueString;
  const paramExpression = bindingParamExtension.extension?.find((ext) => ext.url === 'expression');

  if (!paramName || !paramExpression) {
    return null;
  }

  // extension:expression has a valueExpression
  if (
    paramExpression.valueExpression?.expression &&
    paramExpression.valueExpression?.language === 'text/fhirpath'
  ) {
    return {
      name: paramName,
      value: '',
      fhirPathExpression: paramExpression.valueExpression.expression
    };
  }

  // extension:expression has a valueString
  if (paramExpression.valueString) {
    return {
      name: paramName,
      value: paramExpression.valueString
    };
  }

  return null;
}

export function getBindingParameters(
  qItem: QuestionnaireItem,
  initialValueSetUrl: string
): BindingParameter[] {
  if (!qItem._answerValueSet) {
    return [];
  }

  // Reference to contained valueSets doesn't work with binding parameters
  if (initialValueSetUrl.startsWith('#')) {
    return [];
  }

  const bindingParameterExtensions =
    qItem._answerValueSet?.extension?.filter(
      (ext) => ext.url === 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter'
    ) || [];

  const bindingParameters: BindingParameter[] = [];
  for (const bindingParameterExtension of bindingParameterExtensions) {
    if (bindingParameterExtension?.extension) {
      const bindingParameter = getBindingParameter(bindingParameterExtension);
      if (bindingParameter) {
        bindingParameters.push(bindingParameter);
      }
    }
  }

  return bindingParameters;
}

export function addBindingParametersToValueSetUrl(
  valueSetUrl: string,
  bindingParameters: BindingParameter[]
): string {
  for (const bindingParameter of bindingParameters) {
    if (bindingParameter.value !== '') {
      valueSetUrl += `&${bindingParameter.name}=${bindingParameter.value}`;
    }
  }

  return valueSetUrl;
}

interface EvaluateInitialDynamicValueSetsParams {
  initialResponse: QuestionnaireResponse;
  initialResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  processedValueSets: Record<string, ProcessedValueSet>;
  variables: Variables;
  existingFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  terminologyServerUrl: string;
}

export async function evaluateInitialDynamicValueSets(
  params: EvaluateInitialDynamicValueSetsParams
): Promise<{
  initialProcessedValueSets: Record<string, ProcessedValueSet>;
  updatedFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
}> {
  const {
    initialResponse,
    initialResponseItemMap,
    processedValueSets,
    variables,
    existingFhirPathContext,
    terminologyServerUrl
  } = params;
  let { fhirPathTerminologyCache } = params;

  const hasDynamicEntries = Object.values(processedValueSets).some(
    (valueSet) => valueSet.isDynamic
  );
  if (!hasDynamicEntries) {
    return {
      initialProcessedValueSets: processedValueSets,
      updatedFhirPathContext: existingFhirPathContext,
      fhirPathTerminologyCache
    };
  }

  const fhirPathEvalResult = await createFhirPathContext(
    initialResponse,
    initialResponseItemMap,
    variables,
    existingFhirPathContext,
    fhirPathTerminologyCache,
    terminologyServerUrl
  );
  const updatedFhirPathContext = fhirPathEvalResult.fhirPathContext;
  fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;

  for (const key in processedValueSets) {
    const processedValueSet = processedValueSets[key];
    if (!processedValueSet.isDynamic) {
      continue;
    }

    for (const bindingParameter of processedValueSet.bindingParameters) {
      if (bindingParameter.fhirPathExpression) {
        if (isExpressionCached(bindingParameter.fhirPathExpression, fhirPathTerminologyCache)) {
          continue;
        }

        try {
          const fhirPathResult = fhirpath.evaluate(
            {},
            bindingParameter.fhirPathExpression,
            updatedFhirPathContext,
            fhirpath_r4_model,
            {
              async: true,
              terminologyUrl: terminologyServerUrl
            }
          );
          const result = await handleFhirPathResult(fhirPathResult);

          // If fhirPathResult is an async terminology call, cache the result
          if (fhirPathResult instanceof Promise) {
            cacheTerminologyResult(
              bindingParameter.fhirPathExpression,
              result,
              fhirPathTerminologyCache
            );
          }

          /*
           * Update processedValueSet.updatableValueSetUrl (add or remove p-param)
           * Only update when current processedValueSet.updatableValueSetUrl value is different from the result, otherwise it will result in an infinite loop as per issue #733
           */
          // Add p-param if result exists, is string, and is different from current value
          const hasNewPParam =
            result.length > 0 &&
            typeof result[0] === 'string' &&
            bindingParameter.value !== result[0];

          // Remove p-param if result is empty, and current value is not an empty string
          const toRemovePParam = result.length === 0 && bindingParameter.value !== '';
          if (hasNewPParam || toRemovePParam) {
            bindingParameter.value = hasNewPParam ? result[0] : '';
            processedValueSet.updatableValueSetUrl = addBindingParametersToValueSetUrl(
              processedValueSet.initialValueSetUrl,
              processedValueSet.bindingParameters
            );
          }
        } catch (e) {
          console.warn(
            e.message,
            `Dynamic ValueSets Key: ${key}\nExpression: ${bindingParameter.fhirPathExpression}`
          );
        }
      }
    }
  }

  return {
    initialProcessedValueSets: processedValueSets,
    updatedFhirPathContext,
    fhirPathTerminologyCache
  };
}

export async function evaluateDynamicValueSets(
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  processedValueSets: Record<string, ProcessedValueSet>,
  terminologyServerUrl: string
): Promise<{
  isUpdated: boolean;
  updatedProcessedValueSets: Record<string, ProcessedValueSet>;
  computedNewAnswers: ComputedNewAnswers;
}> {
  let isUpdated = false;
  let computedNewAnswers: ComputedNewAnswers = {};
  for (const key in processedValueSets) {
    const processedValueSet = processedValueSets[key];
    if (!processedValueSet.isDynamic) {
      continue;
    }

    for (const bindingParameter of processedValueSet.bindingParameters) {
      if (bindingParameter.fhirPathExpression) {
        if (isExpressionCached(bindingParameter.fhirPathExpression, fhirPathTerminologyCache)) {
          continue;
        }

        try {
          const fhirPathResult = fhirpath.evaluate(
            {},
            bindingParameter.fhirPathExpression,
            fhirPathContext,
            fhirpath_r4_model,
            {
              async: true,
              terminologyUrl: terminologyServerUrl
            }
          );
          const result = await handleFhirPathResult(fhirPathResult);

          // If fhirPathResult is an async terminology call, cache the result
          if (fhirPathResult instanceof Promise) {
            cacheTerminologyResult(
              bindingParameter.fhirPathExpression,
              result,
              fhirPathTerminologyCache
            );
          }

          /*
           * Update processedValueSet.updatableValueSetUrl (add or remove p-param)
           * Only update when current processedValueSet.updatableValueSetUrl value is different from the result, otherwise it will result in an infinite loop as per issue #733
           */
          // Add p-param if result exists, is string, and is different from current value
          const hasNewPParam =
            result.length > 0 &&
            typeof result[0] === 'string' &&
            bindingParameter.value !== result[0];

          // Remove p-param if result is empty, and current value is not an empty string
          const toRemovePParam = result.length === 0 && bindingParameter.value !== '';
          if (hasNewPParam || toRemovePParam) {
            isUpdated = true;
            bindingParameter.value = hasNewPParam ? result[0] : '';
            processedValueSet.updatableValueSetUrl = addBindingParametersToValueSetUrl(
              processedValueSet.initialValueSetUrl,
              processedValueSet.bindingParameters
            );

            computedNewAnswers = {
              ...computedNewAnswers,
              ...getComputedAnswerUpdates(processedValueSet.linkIds)
            };
          }
        } catch (e) {
          console.warn(
            e.message,
            `Dynamic ValueSets Key: ${key}\nExpression: ${bindingParameter.fhirPathExpression}`
          );
        }
      }
    }
  }

  return {
    isUpdated,
    updatedProcessedValueSets: processedValueSets,
    computedNewAnswers
  };
}

// For parameterised valueSets, if the valueSet options is updated, clear the answers
function getComputedAnswerUpdates(linkIds: string[]): ComputedNewAnswers {
  const computedAnswerUpdates: ComputedNewAnswers = {};
  for (const linkId of linkIds) {
    computedAnswerUpdates[linkId] = null;
  }

  return computedAnswerUpdates;
}
