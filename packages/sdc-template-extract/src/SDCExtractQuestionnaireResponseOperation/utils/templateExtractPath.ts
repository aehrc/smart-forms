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
    for (const [logicalPath, value] of templateExtractPath.valuePathMap.entries()) {
      valuePathMap.set(logicalPath, value);
    }
  }

  return valuePathMap;
}

/**
 * Logs a summary table of all extractable context and value paths from a given template.
 * Useful for debugging or inspecting the structure of a `TemplateExtractPath` map.
 *
 * Each row of the table includes:
 * - the entry path (FHIRPath to the context element),
 * - the context location and expression,
 * - the value path and corresponding extract expression.
 *
 * @param {string} templateId - The identifier for the template being logged.
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - A map of FHIRPath entries to `TemplateExtractPath` objects, representing extract contexts and value expressions.
 *
 * @example
 * Example output:
 *
 * ```
 * 🔢 Template Extract Paths for: PatientTemplate
 *
 * | entryPath              | contextPath                       | contextExpression                                  | valuePath                                 | valueExpression                                                      |
 * |------------------------|-----------------------------------|----------------------------------------------------|-------------------------------------------|----------------------------------------------------------------------|
 * | Patient.identifier[0]  | Patient.identifier[0].extension[0]| item.where(linkId = 'ihi').answer.value            | Patient.identifier[0]._value.extension[0] | first()                                                              |
 * | Patient.name[0]        | Patient.name[0].extension[0]      | item.where(linkId = 'name')                        | Patient.name[0]._text.extension[0]        | item.where(linkId='given' or linkId='family').answer.value.join(' ') |
 * | Patient.name[0]        | Patient.name[0].extension[0]      | item.where(linkId = 'name')                        | Patient.name[0]._family.extension[0]      | item.where(linkId = 'family').answer.value.first()                   |
 * | Patient.telecom[0]     | Patient.telecom[0].extension[0]   | item.where(linkId = 'mobile-phone').answer.value   | Patient.telecom[0]._value.extension[0]    | first()                                                              |
 * | Patient._gender        | <empty string>                    | <empty string>                                     | Patient._gender.extension[0]              | item.where(linkId = 'gender').answer.value.first().code              |
 * ```
 */
export function logTemplateExtractPaths(
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>
) {
  const table: {
    entryPath: string;
    contextPath: string | null;
    contextExpression: string | null;
    valuePath: string | null;
    valueExpression: string | null;
  }[] = [];

  for (const [entryPath, { contextPathTuple, valuePathMap }] of templateExtractPathMap.entries()) {
    const contextLoc = contextPathTuple?.[0] ?? null;
    const contextExpr = contextPathTuple?.[1] ?? null;

    for (const [valuePath, valueExpr] of valuePathMap.entries()) {
      table.push({
        entryPath: entryPath,
        contextPath: contextLoc,
        contextExpression: contextExpr,
        valuePath: valuePath,
        valueExpression: valueExpr
      });
    }

    if (valuePathMap.size === 0) {
      table.push({
        entryPath: entryPath,
        contextPath: contextLoc,
        contextExpression: contextExpr,
        valuePath: null,
        valueExpression: null
      });
    }
  }

  console.log(`\n🔢Template Extract Paths for: ${templateId}`);
  console.table(table);
}
