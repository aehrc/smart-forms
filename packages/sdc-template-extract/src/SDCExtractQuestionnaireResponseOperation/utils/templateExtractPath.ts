import { FhirResource, OperationOutcomeIssue } from 'fhir/r4';
import { TemplateExtractPath } from '../interfaces/templateExtractPath.interface';
import {
  walkTemplateForContexts,
  walkTemplateForContextValues,
  walkTemplateForStandaloneValues
} from './walkTemplate';
import { fhirPathEvaluate } from './fhirpathEvaluate';

/**
 * Builds a map of FHIRPath expressions representing extractable data from a template,
 * and collects any warnings encountered during traversal.
 *
 * This function performs three main steps:
 * 1. Walks the resource to find all `templateExtractContext` extensions and builds a path map.
 * 2. Walks the subtree of each context to find associated `templateExtractValue` extensions.
 * 3. Walks the resource again to collect standalone `templateExtractValue` extensions not tied to a context.
 *
 * @param {string} templateId - The ID of the template being processed. Used for namespacing extract paths.
 * @param {FhirResource} resource - The FHIR resource containing the template definition, typically a contained StructureDefinition or similar.
 *
 * @returns {{
 *   templateExtractPathMap: Map<string, TemplateExtractPath>,
 *   walkTemplateWarnings: OperationOutcomeIssue[]
 * }} An object containing:
 * - `templateExtractPathMap`: A map from FHIRPath strings to `TemplateExtractPath` objects describing context/value pairs.
 * - `walkTemplateWarnings`: A list of issues (`OperationOutcomeIssue`) generated during traversal, such as missing expected fields or invalid structures.
 */
export function createTemplateExtractPathMap(
  templateId: string,
  resource: FhirResource
): {
  templateExtractPathMap: Map<string, TemplateExtractPath>;
  walkTemplateWarnings: OperationOutcomeIssue[];
} {
  const basePath = resource.resourceType || 'Resource';

  // First step: walk template to get all templateExtractContexts
  const templateExtractPathMap = new Map<string, TemplateExtractPath>();
  const walkTemplateWarnings: OperationOutcomeIssue[] = [];

  walkTemplateForContexts(
    resource,
    basePath,
    templateId,
    templateExtractPathMap,
    walkTemplateWarnings
  );

  // Second step: walk template to assign templateExtractValues to their contexts
  for (const templateExtractEntryPath of templateExtractPathMap.keys()) {
    const evaluateResult = fhirPathEvaluate({
      fhirData: resource,
      path: templateExtractEntryPath,
      envVars: {},
      warnings: walkTemplateWarnings
    });
    const subtree = evaluateResult[0];
    if (typeof subtree === 'object' && subtree !== null) {
      walkTemplateForContextValues(
        subtree,
        templateExtractEntryPath,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings,
        templateExtractEntryPath
      );
    }
  }

  // Third step: walk template to get standalone templateExtractValues (without a parent context)
  // flatten the values path in templateExtractPaths
  const valuePathMap = flattenValuePathMaps(templateExtractPathMap);
  walkTemplateForStandaloneValues(
    resource,
    basePath,
    templateId,
    templateExtractPathMap,
    walkTemplateWarnings,
    valuePathMap
  );

  return {
    templateExtractPathMap: templateExtractPathMap,
    walkTemplateWarnings
  };
}

/**
 * Flattens all `valuePathMap` entries from a map of `TemplateExtractPath` objects
 * into a single map of logical path to value expression.
 *
 * This is useful for quickly looking up all extractable value paths across all contexts
 * in a template extract definition.
 *
 * @param {Map<string, TemplateExtractPath>} templateExtractPaths -
 *   A map of FHIRPath entry strings to their corresponding `TemplateExtractPath` objects.
 *
 * @returns {Map<string, string>} A flattened map where keys are logical value paths and values are FHIRPath expressions.
 */
function flattenValuePathMaps(
  templateExtractPaths: Map<string, TemplateExtractPath>
): Map<string, string> {
  const valuePathMap = new Map<string, string>();

  for (const templateExtractPath of templateExtractPaths.values()) {
    for (const [logicalPath, valueEvaluation] of templateExtractPath.valuePathMap.entries()) {
      valuePathMap.set(logicalPath, valueEvaluation.valueExpression);
    }
  }

  return valuePathMap;
}
