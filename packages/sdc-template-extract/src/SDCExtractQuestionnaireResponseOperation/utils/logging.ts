import type {
  TemplateExtractPath,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';

/**
 * Logs a summary table of all extractable context and value paths from a given template.
 * Useful for debugging or inspecting the structure of a `TemplateExtractPath` map.
 *
 * Each row of the table includes:
 * - the entry path (FHIRPath to the context element),
 * - the context location, expression and result
 * - the value path and corresponding extract expression + result.
 *
 * @param {string} templateId - The identifier for the template being logged.
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - A map of FHIRPath entries to `TemplateExtractPath` objects, representing extract contexts and value expressions.
 *
 * @example
 * Example output:
 *
 * ```
 * 🔢 All columns for: PatientTemplate
 *
 * | entryPath             | contextPath                        | contextExpression                                | valuePath                                 | valueExpression                                                      | valueResult            |
 * |-----------------------|----------------------------------- |------------------------------------------------- |------------------------------------------ |--------------------------------------------------------------------- |------------------------|
 * | Patient.identifier[0] | Patient.identifier[0].extension[0] | item.where(linkId = 'ihi').answer.value          | Patient.identifier[0]._value.extension[0] | first()                                                              | [ "8003608833357361" ] |
 * | Patient.name[0]       | Patient.name[0].extension[0]       | item.where(linkId = 'name')                      | Patient.name[0]._text.extension[0]        | item.where(linkId='given' or linkId='family').answer.value.join(' ') | [ "Jane" ]             |
 * | Patient.name[0]       | Patient.name[0].extension[0]       | item.where(linkId = 'name')                      | Patient.name[0]._family.extension[0]      | item.where(linkId = 'family').answer.value.first()                   | [ "Doe" ]              |
 * | Patient.telecom[0]    | Patient.telecom[0].extension[0]    | item.where(linkId = 'mobile-phone').answer.value | Patient.telecom[0]._value.extension[0]    | first()                                                              | [ "0491 572 665" ]     |
 * | Patient._gender       | null                               | null                                             | Patient._gender.extension[0]              | item.where(linkId = 'gender').answer.value.first().code              | [ "female" ]           |
 * ```
 */
export function logTemplateExtractPathMapFull(
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>
) {
  const table: {
    entryPath: string;
    contextPath: string | null;
    contextExpression: string | null;
    valuePath: string | null;
    valueExpression: string | null;
    valueResult: any;
  }[] = [];

  for (const [entryPath, { contextPathTuple, valuePathMap }] of templateExtractPathMap.entries()) {
    const contextPath = contextPathTuple?.[0] ?? null;
    const contextExpression = contextPathTuple?.[1] ?? null;

    for (const [valuePath, valueEvaluation] of valuePathMap.entries()) {
      const { valueExpression, valueResult } = valueEvaluation;
      table.push({
        entryPath: entryPath,
        contextPath: contextPath,
        contextExpression: contextExpression,
        valuePath: valuePath,
        valueExpression: valueExpression,
        valueResult: valueResult
      });
    }

    if (valuePathMap.size === 0) {
      table.push({
        entryPath: entryPath,
        contextPath: contextPath,
        contextExpression: contextExpression,
        valuePath: null,
        valueExpression: null,
        valueResult: null
      });
    }
  }

  console.log(`\n📋 Contexts and values for template: ${templateId}`);
  console.table(table);
}

// JS Object version
export function logTemplateExtractPathMapJsObjectFull(
  templateId: string,
  templateExtractPathMap: Record<string, TemplateExtractPathJsObject>
) {
  const table: {
    entryPath: string;
    contextPath: string | null;
    contextExpression: string | null;
    valuePath: string | null;
    valueExpression: string | null;
    valueResult: any;
  }[] = [];

  for (const [entryPath, { contextPathTuple, valuePathMap }] of Object.entries(
    templateExtractPathMap
  )) {
    const contextPath = contextPathTuple?.[0] ?? null;
    const contextExpression = contextPathTuple?.[1] ?? null;

    const valuePaths = Object.entries(valuePathMap ?? {});

    if (valuePaths.length > 0) {
      for (const [valuePath, { valueExpression, valueResult }] of valuePaths) {
        table.push({
          entryPath,
          contextPath,
          contextExpression,
          valuePath,
          valueExpression,
          valueResult
        });
      }
    } else {
      table.push({
        entryPath,
        contextPath,
        contextExpression,
        valuePath: null,
        valueExpression: null,
        valueResult: null
      });
    }
  }

  console.log(`\n📋 Contexts and values for template: ${templateId}`);
  console.table(table);
}

/**
 * Logs a simplified table showing only the entry path, evaluated context result,
 * and the evaluated value result for each extractable template path.
 *
 * This is useful for quickly verifying extracted values without inspecting the full expression logic.
 *
 * Each row includes:
 * - `entryPath`: The FHIRPath location in the resource,
 * - `valueResult`: The result of evaluating the value expression.
 *
 * @param {string} templateId - The identifier for the template being logged.
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - A map of FHIRPath entries to `TemplateExtractPath` objects, representing extract contexts and value expressions.
 *
 * @example
 * Example output:
 *
 * ```
 * 🔹 Result columns for: PatientTemplate
 *
 * | entryPath             | valueResult            |
 * |-----------------------|------------------------|
 * | Patient.identifier[0] | [ "8003608833357361" ] |
 * | Patient.name[0]       | [ "Jane" ]             |
 * | Patient.name[0]       | [ "Doe" ]              |
 * | Patient.telecom[0]    | [ "0491 572 665" ]     |
 * | Patient._gender       | [ "female" ]           |
 * ```
 */
export function logTemplateExtractPathMapResults(
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>
) {
  const table: {
    entryPath: string;
    valueResult: any;
  }[] = [];

  for (const [entryPath, templateExtractPath] of templateExtractPathMap.entries()) {
    const { valuePathMap } = templateExtractPath;

    for (const [, valueEvaluation] of valuePathMap.entries()) {
      const { valueResult } = valueEvaluation;
      table.push({
        entryPath,
        valueResult
      });
    }

    if (valuePathMap.size === 0) {
      table.push({
        entryPath,
        valueResult: null
      });
    }
  }

  console.log(`\n🔹Context and value results for: ${templateId}`);
  console.table(table);
}

// JS Object version
export function logTemplateExtractPathMapJsObjectResults(
  templateId: string,
  templateExtractPathMap: Record<string, TemplateExtractPathJsObject>
) {
  const table: {
    entryPath: string;
    valueResult: any;
  }[] = [];

  for (const [entryPath, templateExtractPath] of Object.entries(templateExtractPathMap)) {
    const { valuePathMap } = templateExtractPath;

    const valuePaths = Object.values(valuePathMap ?? {});
    if (valuePaths.length > 0) {
      for (const { valueResult } of valuePaths) {
        table.push({
          entryPath,
          valueResult
        });
      }
    } else {
      table.push({
        entryPath,
        valueResult: null
      });
    }
  }

  console.log(`\n🔹Context and value results for: ${templateId}`);
  console.table(table);
}
