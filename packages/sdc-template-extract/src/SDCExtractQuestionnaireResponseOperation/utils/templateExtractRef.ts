import type { Extension, OperationOutcomeIssue, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type { TemplateExtractReference } from '../interfaces/templateExtractReference.interface';
import {
  isFullUrlExtensionSlice,
  isIfMatchExtensionSlice,
  isIfModifiedSinceExtensionSlice,
  isIfNoneExistExtensionSlice,
  isIfNoneMatchExtensionSlice,
  isPatchRequestUrlExtensionSlice,
  isResourceIdExtensionSlice,
  isTemplateExtensionSlice
} from './typePredicates';
import { createInvalidWarningIssue } from './operationOutcome';

/**
 * Parses and validates `sdc-questionnaire-templateExtract` extensions on a Questionnaire or QuestionnaireItem.
 *
 * This function extracts a structured `TemplateExtractReference` object from any extensions if present,
 * and verifies cardinality rules and format constraints for each known slice (e.g. `template`, `fullUrl`, etc.).
 * It also collects any violations into returned `OperationOutcomeIssue` warnings.
 *
 * Known validation rules:
 * - `template` slice must appear exactly once and must reference a contained resource (`#id` format).
 * - All slice URLs (except `template`) must occur at most once (0..1 cardinality).
 * - No nested extensions are allowed within any slice.
 *
 * @param {QuestionnaireItem | Questionnaire} item - The FHIR item to check for the extension.
 *
 * @returns {{
 *   templateExtractRefs: TemplateExtractReference[],
 *   warnings?: OperationOutcomeIssue[]
 * }}
 */
export function hasTemplateExtractRefExtension(item: QuestionnaireItem | Questionnaire): {
  templateExtractRefs: TemplateExtractReference[];
  warnings?: OperationOutcomeIssue[];
} {
  if (!item.extension || item.extension.length === 0) {
    return {
      templateExtractRefs: []
    };
  }

  const templateExtractRefExtension = item.extension.filter(
    (extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
  );

  const itemId = 'linkId' in item ? item.linkId : 'QuestionnaireLevel';

  return templateExtractRefExtension
    .map((ext) => validateAndExtractTemplateExtractReference(ext, itemId))
    .reduce(
      (acc, { templateExtractRef, warning }) => {
        if (templateExtractRef) acc.templateExtractRefs.push(templateExtractRef);

        if (warning) {
          if (!acc.warnings) {
            acc.warnings = [];
          }
          acc.warnings.push(warning);
        }
        return acc;
      },
      {
        templateExtractRefs: []
      } as {
        templateExtractRefs: TemplateExtractReference[];
        warnings?: OperationOutcomeIssue[];
      }
    );
}

/**
 * Checks whether a Questionnaire or any of its items contains a valid `sdc-questionnaire-templateExtract` extension with a required `template` slice.
 * Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension.
 *
 * @param questionnaire - The FHIR Questionnaire to check.
 * @returns `true` if at least one valid template extract reference exists.
 */
export function canBeTemplateExtracted(questionnaire: Questionnaire): boolean {
  // Check Questionnaire-level extension
  const { templateExtractRefs } = hasTemplateExtractRefExtension(questionnaire);
  if (templateExtractRefs?.length) {
    return true;
  }

  // Check item-level extensions recursively
  if (questionnaire.item) {
    return questionnaire.item.some((item) => hasTemplateExtractRefExtensionRecursive(item));
  }

  return false;
}
/**
 * Recursively checks whether a `QuestionnaireItem` or any of its child items contains a `sdc-questionnaire-templateExtract` extension with a required `template` slice.
 * Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension.
 */
function hasTemplateExtractRefExtensionRecursive(item: QuestionnaireItem): boolean {
  const { templateExtractRefs } = hasTemplateExtractRefExtension(item);
  if (templateExtractRefs?.length) {
    return true;
  }

  return item.item?.some((child) => hasTemplateExtractRefExtensionRecursive(child)) ?? false;
}

/**
 * Traverses a FHIR Questionnaire and collects all `sdc-questionnaire-templateExtract` extensions
 * that contain a required `template` slice. Also includes the Questionnaire-level extension if present.
 *
 * @param questionnaire - The FHIR Questionnaire resource to process.
 * @returns A Map where each key is a `QuestionnaireItem.linkId`, or 'QuestionnaireLevel', and the value is the extract template slice set.
 */
export function collectTemplateExtractRefs(questionnaire: Questionnaire): {
  templateExtractRefMap: Map<string, TemplateExtractReference[]>;
  templateExtractRefWarnings: OperationOutcomeIssue[];
} {
  const templateExtractRefMap = new Map<string, TemplateExtractReference[]>();
  const templateExtractRefWarnings: OperationOutcomeIssue[] = [];

  // Handle Questionnaire-level extension
  const { templateExtractRefs, warnings } = hasTemplateExtractRefExtension(questionnaire);
  if (templateExtractRefs?.length) {
    templateExtractRefMap.set('QuestionnaireLevel', templateExtractRefs);
  }

  if (warnings) {
    templateExtractRefWarnings.push(...warnings);
  }

  // Handle item-level extensions
  if (questionnaire.item) {
    for (const item of questionnaire.item) {
      collectTemplateExtractRefRecursive(item, templateExtractRefMap, templateExtractRefWarnings);
    }
  }

  return { templateExtractRefMap, templateExtractRefWarnings };
}

/**
 * Recursively walks through a QuestionnaireItem tree, extracting `templateExtract` extensions
 * and populating a map with entries where the required `template` slice exists.
 *
 * @param qItem - The QuestionnaireItem to evaluate.
 * @param templateExtractRefMap - A Map to populate with extracted template slices, keyed by `linkId`.
 * @param templateExtractRefWarnings - An array to collect any cardinality-related warnings encountered during collection. Each warning is an OperationOutcomeIssue describing missing or extra extensions within a `templateExtract` slice.
 */
function collectTemplateExtractRefRecursive(
  qItem: QuestionnaireItem,
  templateExtractRefMap: Map<string, TemplateExtractReference[]>,
  templateExtractRefWarnings: OperationOutcomeIssue[]
): void {
  const { templateExtractRefs, warnings } = hasTemplateExtractRefExtension(qItem);
  if (templateExtractRefs?.length) {
    templateExtractRefMap.set(qItem.linkId, templateExtractRefs); // Cast is safe because `template` is required
  }

  if (warnings) templateExtractRefWarnings.push(...warnings);

  if (qItem.item) {
    for (const childQItem of qItem.item) {
      collectTemplateExtractRefRecursive(
        childQItem,
        templateExtractRefMap,
        templateExtractRefWarnings
      );
    }
  }
}

/**
 * Extracts a structured `TemplateExtractReference` object from the given templateExtract extension,
 * and verifies cardinality rules and format constraints for each known slice (e.g. `template`, `fullUrl`, etc.).
 * It also collects any violations into a returned `OperationOutcomeIssue` warning.
 *
 * Known validation rules:
 * - `template` slice must appear exactly once and must reference a contained resource (`#id` format).
 * - All slice URLs (except `template`) must occur at most once (0..1 cardinality).
 * - No nested extensions are allowed within any slice.
 *
 * @param {Extension} templateExtractRefExtension - The templateExtract extension.
 * @param {string} itemId - The linkId of the QuestionnaireItem or 'QuestionnaireLevel' for Questionnaire-level extensions.
 *
 * @returns {{
 *   templateExtractRef: TemplateExtractReference | null,
 *   warning?: OperationOutcomeIssue
 * }}
 */
function validateAndExtractTemplateExtractReference(
  templateExtractRefExtension: Extension,
  itemId: string
): {
  templateExtractRef: TemplateExtractReference | null;
  warning?: OperationOutcomeIssue;
} {
  const templateExtractRefSlices = templateExtractRefExtension.extension ?? [];
  const cardinalityWarningStrings: string[] = [];
  let templateCount = 0;
  const seenSliceNames = new Set<string>();

  const templateExtractRef: Partial<TemplateExtractReference> = {};

  for (const slice of templateExtractRefSlices) {
    // Check if the slice has nested extensions
    if (slice.extension && slice.extension.length > 0) {
      cardinalityWarningStrings.push(
        `Extension slice with url "${slice.url}" must not have nested extensions (0..0).`
      );
    }

    if (isTemplateExtensionSlice(slice)) {
      const ref = slice.valueReference?.reference;
      if (ref && ref.startsWith('#')) {
        if (templateCount === 0) {
          templateExtractRef.templateId = ref.substring(1); // remove leading '#'
        }
        templateCount++;
      } else {
        cardinalityWarningStrings.push(
          `Invalid "template" reference format in ${itemId}: must start with '#'`
        );
      }
      continue;
    }

    // Track slice URLs to catch duplicates (for 0..1 constraints)
    if (seenSliceNames.has(slice.url)) {
      cardinalityWarningStrings.push(
        `Extension slice "${slice.url}" must not appear more than once (0..1).`
      );
      continue;
    }
    seenSliceNames.add(slice.url);

    if (isFullUrlExtensionSlice(slice)) {
      templateExtractRef.fullUrl = slice.valueString;
      continue;
    }

    if (isResourceIdExtensionSlice(slice)) {
      templateExtractRef.resourceId = slice.valueString;
      continue;
    }

    if (isPatchRequestUrlExtensionSlice(slice)) {
      templateExtractRef.patchRequestUrl = slice.valueString;

      // resourceId and patchRequestUrl cannot both be present at the same time
      if (templateExtractRef.resourceId) {
        cardinalityWarningStrings.push(
          `Extension slices "resourceId" and "patchRequestUrl" cannot both be present at the same time.`
        );
      }
      continue;
    }

    if (isIfNoneMatchExtensionSlice(slice)) {
      templateExtractRef.ifNoneMatch = slice.valueString;
      continue;
    }

    if (isIfModifiedSinceExtensionSlice(slice)) {
      templateExtractRef.ifModifiedSince = slice.valueString;
      continue;
    }

    if (isIfMatchExtensionSlice(slice)) {
      templateExtractRef.ifMatch = slice.valueString;
      continue;
    }

    if (isIfNoneExistExtensionSlice(slice)) {
      templateExtractRef.ifNoneExist = slice.valueString;
    }
  }

  // Extension.template slice is required, and it should only appear once
  if (!templateExtractRef.templateId) {
    return {
      templateExtractRef: null,
      warning: createInvalidWarningIssue(
        `sdc-questionnaire-templateExtract found in ${itemId}, but missing required "template" slice or it may be invalid.`
      )
    };
  }

  if (templateCount > 1) {
    cardinalityWarningStrings.push(
      `Extension slice "template" must appear exactly once (1..1), but found ${templateCount}.`
    );
  }

  let warning: OperationOutcomeIssue | undefined;
  if (cardinalityWarningStrings.length > 0) {
    warning = createInvalidWarningIssue(
      `Cardinality issues in ${itemId} sdc-questionnaire-templateExtract:\n- ${cardinalityWarningStrings.join('\n- ')}`
    );
  }

  // We have validated that extension.template slice is present, so we can safely cast to ExtractedTemplate
  return {
    templateExtractRef: templateExtractRef as TemplateExtractReference,
    ...(warning && { warning: warning })
  };
}
