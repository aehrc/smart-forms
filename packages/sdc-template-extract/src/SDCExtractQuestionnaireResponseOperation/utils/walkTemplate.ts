import type { OperationOutcomeIssue } from 'fhir/r4';
import { createInvalidWarningIssue } from './operationOutcome';
import type {
  TemplateExtractPath,
  TemplateExtractValueEvaluation
} from '../interfaces/templateExtractPath.interface';

/**
 * Recursively traverses a FHIR resource or JSON structure to identify and record
 * all `templateExtractContext` extensions within `extension` arrays. Builds a map of
 * `contextPathTuple` entries for later extraction of values.
 *
 * @param {any} obj - The FHIR resource or nested object to walk. Can be an array, object, primitive, or null.
 * @param {string} currentPath - The FHIRPath-style path leading to the current node in the object tree.
 * @param {string} templateId - Identifier of the template currently being processed (used in warnings).
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - A map to collect context paths and associated value paths.
 * @param {OperationOutcomeIssue[]} walkTemplateWarnings - A list to which warning issues will be pushed if invalid data is found.
 */
export function walkTemplateForContexts(
  obj: any, // This is any because it can refer to anything, a FHIR resource, an extension (array), string, identifier, dateTime, JSON object, etc.
  currentPath: string,
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>,
  walkTemplateWarnings: OperationOutcomeIssue[]
): void {
  // obj is an array
  if (Array.isArray(obj)) {
    obj.forEach((item, index) =>
      walkTemplateForContexts(
        item,
        `${currentPath}[${index}]`,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings
      )
    );
    return;
  }

  // obj is a object
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const childPath = `${currentPath}.${key}`;

      // Look for extension array containing templateExtractContext extensions
      if (key === 'extension' && Array.isArray(value)) {
        addTemplateExtractContexts(
          value,
          childPath,
          currentPath,
          templateId,
          templateExtractPathMap,
          walkTemplateWarnings
        );
      }

      walkTemplateForContexts(
        value,
        childPath,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings
      );
    }
  }

  return;
}

/**
 * Searches an `extension` array for the `templateExtractContext` extension defined by
 * the SDC specification, and adds it to the extract path map if valid.
 *
 * @param {any[]} value - The array of extensions on a FHIR element (e.g., `identifier.extension`).
 * @param {string} childPath - Full path to the extension array in the parent object.
 * @param {string} currentPath - The FHIRPath-style path of the parent element containing the extension.
 * @param {string} templateId - The ID of the current template being processed.
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - The map used to collect context and value mappings.
 * @param {OperationOutcomeIssue[]} walkTemplateWarnings - A list where validation warnings are pushed.
 */
function addTemplateExtractContexts(
  value: any[],
  childPath: string,
  currentPath: string,
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>,
  walkTemplateWarnings: OperationOutcomeIssue[]
): void {
  // Find if templateExtractContext extension exists
  const templateExtractContextIndex = value.findIndex(
    (ext) =>
      ext.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext'
  );
  if (templateExtractContextIndex !== -1) {
    const templateExtractContext = value[templateExtractContextIndex];
    const logicalPath = `${childPath}[${templateExtractContextIndex}]`;
    if (templateExtractContext?.valueString) {
      // e.g. Patient.identifier[0].extension[0]
      templateExtractPathMap.set(currentPath, {
        contextPathTuple: [logicalPath, templateExtractContext.valueString],
        valuePathMap: new Map<string, TemplateExtractValueEvaluation>()
      });
    } else {
      walkTemplateWarnings.push(
        createInvalidWarningIssue(
          `Template ${templateId}: TemplateExtractContext extension found on ${logicalPath} but no valueString found.`
        )
      );
    }
  }

  return;
}

/* TemplateExtractValue with templateExtractEntryPath */

/**
 * Recursively walks through a FHIR resource or arbitrary JSON structure to locate and collect
 * `templateExtractValue` extensions. These are used to define FHIRPath expressions for extracting
 * values from within the context previously defined via `templateExtractContext`.
 *
 * @param {any} obj - The FHIR resource or nested JSON object/array to walk through.
 * @param {string} currentPath - Current FHIRPath-like string representing the path to the object.
 * @param {string} templateId - Identifier for the template being processed.
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - Map collecting context and value paths.
 * @param {OperationOutcomeIssue[]} walkTemplateWarnings - List to accumulate any warnings generated while walking.
 * @param {string} templateExtractEntryPath - The entry path key corresponding to the context this value belongs to.
 */
export function walkTemplateForContextValues(
  obj: any, // This is any because it can refer to anything, a FHIR resource, an extension (array), string, identifier, dateTime, JSON object, etc.
  currentPath: string,
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>,
  walkTemplateWarnings: OperationOutcomeIssue[],
  templateExtractEntryPath: string
): void {
  // obj is an array
  if (Array.isArray(obj)) {
    obj.forEach((item, index) =>
      walkTemplateForContextValues(
        item,
        `${currentPath}[${index}]`,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings,
        templateExtractEntryPath
      )
    );
    return;
  }

  // obj is a object
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const childPath = `${currentPath}.${key}`;

      // Look for extension array containing templateExtractContext extensions
      if (key === 'extension' && Array.isArray(value)) {
        addTemplateExtractContextValues(
          value,
          childPath,
          currentPath,
          templateId,
          templateExtractPathMap,
          walkTemplateWarnings,
          templateExtractEntryPath
        );
      }

      walkTemplateForContextValues(
        value,
        childPath,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings,
        templateExtractEntryPath
      );
    }
  }

  return;
}

/**
 * Adds a `templateExtractValue` extension (if found) to the `valuePathMap` within the appropriate
 * `TemplateExtractPath` in `templateExtractPathMap`. These specify how to extract values within the
 * previously defined context.
 *
 * @param {any[]} value - The array of extensions on a FHIR element.
 * @param {string} childPath - Path to the extension array (e.g., `Patient.identifier[0].extension`).
 * @param {string} currentPath - Path to the parent element.
 * @param {string} templateId - Identifier for the template (used for logging warnings).
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - Map collecting context and value extraction paths.
 * @param {OperationOutcomeIssue[]} walkTemplateWarnings - List of warnings for malformed entries.
 * @param {string} templateExtractEntryPath - Path to the entry where this value extraction belongs (i.e., maps to a context).
 */
function addTemplateExtractContextValues(
  value: any[],
  childPath: string,
  currentPath: string,
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>,
  walkTemplateWarnings: OperationOutcomeIssue[],
  templateExtractEntryPath: string
): void {
  // Find if templateExtractValue extension exists
  const templateExtractValueIndex = value.findIndex(
    (ext) =>
      ext.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue'
  );
  if (templateExtractValueIndex !== -1) {
    const templateExtractValue = value[templateExtractValueIndex];
    const logicalPath = `${childPath}[${templateExtractValueIndex}]`;
    if (templateExtractValue?.valueString) {
      // e.g. Patient.identifier[0].extension[0]
      const valueEvaluation: TemplateExtractValueEvaluation = {
        valueExpression: templateExtractValue.valueString,
        valueResult: []
      };
      if (templateExtractPathMap.has(templateExtractEntryPath)) {
        const templateExtractPath = templateExtractPathMap.get(templateExtractEntryPath);
        if (templateExtractPath) {
          templateExtractPath.valuePathMap.set(logicalPath, valueEvaluation);
        }
      } else {
        templateExtractPathMap.set(currentPath, {
          contextPathTuple: null,
          valuePathMap: new Map<string, TemplateExtractValueEvaluation>([
            [logicalPath, valueEvaluation]
          ])
        });
      }
    } else {
      walkTemplateWarnings.push(
        createInvalidWarningIssue(
          `Template ${templateId}: TemplateExtractContext extension found on ${logicalPath} but no valueString found.`
        )
      );
    }
  }

  return;
}

/* TemplateExtractValue standalone */

/**
 * Recursively scans a FHIR resource (or any JSON structure) to find
 * `templateExtractValue` extensions that are **not** associated with a
 * `templateExtractContext`.
 *
 * Each standalone value discovered is added to `templateExtractPathMap`
 * under its own `currentPath` key, unless that logical path already exists
 * in `valuePathToValueExpressionMap` (indicating it was captured earlier while walking
 * context-based values).
 *
 * @param {any} obj - The current node being traversed (array, object, primitive, etc.).
 * @param {string} currentPath - FHIRPath-like string representing the path to `obj`.
 * @param {string} templateId - Identifier of the template being processed (used in warnings).
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - Collector for context/value mappings.
 * @param {OperationOutcomeIssue[]} walkTemplateWarnings - Accumulates warnings for malformed extensions.
 * @param {Map<string, string>} valuePathToValueExpressionMap - Flat map of logical paths → value expressions gathered so far; used to avoid duplicates.
 */
export function walkTemplateForStandaloneValues(
  obj: any, // This is any because it can refer to anything, a FHIR resource, an extension (array), string, identifier, dateTime, JSON object, etc.
  currentPath: string,
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>,
  walkTemplateWarnings: OperationOutcomeIssue[],
  valuePathToValueExpressionMap: Map<string, string>
): void {
  // obj is an array
  if (Array.isArray(obj)) {
    obj.forEach((item, index) =>
      walkTemplateForStandaloneValues(
        item,
        `${currentPath}[${index}]`,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings,
        valuePathToValueExpressionMap
      )
    );
    return;
  }

  // obj is a object
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const childPath = `${currentPath}.${key}`;

      // Look for extension array containing templateExtractContext extensions
      if (key === 'extension' && Array.isArray(value)) {
        addTemplateExtractStandaloneValues(
          value,
          childPath,
          currentPath,
          templateId,
          templateExtractPathMap,
          walkTemplateWarnings,
          valuePathToValueExpressionMap
        );
      }

      walkTemplateForStandaloneValues(
        value,
        childPath,
        templateId,
        templateExtractPathMap,
        walkTemplateWarnings,
        valuePathToValueExpressionMap
      );
    }
  }

  return;
}

/**
 * Adds a standalone `templateExtractValue` extension (i.e. one without an associated context)
 * to `templateExtractPathMap`, provided that logical path has not already been recorded in
 * `valuePathMap`.
 *
 * @param {any[]} value - The array of extensions on the current FHIR element.
 * @param {string} childPath - Path to the extension array (e.g. `Patient.name[0].extension`).
 * @param {string} currentPath - Path to the parent element that owns the extension array.
 * @param {string} templateId - Identifier for the template (used in warning messages).
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - Map collecting extract paths.
 * @param {OperationOutcomeIssue[]} walkTemplateWarnings - List of warning issues for invalid entries.
 * @param {Map<string, string>} valuePathMap - Flat map of logical paths already registered, used to skip duplicates.
 */
function addTemplateExtractStandaloneValues(
  value: any[],
  childPath: string,
  currentPath: string,
  templateId: string,
  templateExtractPathMap: Map<string, TemplateExtractPath>,
  walkTemplateWarnings: OperationOutcomeIssue[],
  valuePathMap: Map<string, string>
): void {
  // Find if templateExtractValue extension exists
  const templateExtractValueIndex = value.findIndex(
    (ext) =>
      ext.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue'
  );
  if (templateExtractValueIndex !== -1) {
    const templateExtractValue = value[templateExtractValueIndex];
    const logicalPath = `${childPath}[${templateExtractValueIndex}]`;

    // TemplateExtractValue already exists in a valuePathMap, skip adding
    if (valuePathMap.has(logicalPath)) {
      return;
    }

    if (templateExtractValue?.valueString) {
      // e.g. Patient.identifier[0].extension[0]
      templateExtractPathMap.set(currentPath, {
        contextPathTuple: null,
        valuePathMap: new Map<string, TemplateExtractValueEvaluation>([
          [logicalPath, { valueExpression: templateExtractValue.valueString, valueResult: [] }]
        ])
      });
    } else {
      walkTemplateWarnings.push(
        createInvalidWarningIssue(
          `Template ${templateId}: TemplateExtractContext extension found on ${logicalPath} but no valueString found.`
        )
      );
    }
  }

  return;
}
