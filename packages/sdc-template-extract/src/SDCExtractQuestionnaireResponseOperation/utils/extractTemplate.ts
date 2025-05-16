import type { OperationOutcomeIssue, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type { ExtractTemplate } from '../interfaces/templateExtract.interface';
import {
  isFullUrlExtensionSlice,
  isIfMatchExtensionSlice,
  isIfModifiedSinceExtensionSlice,
  isIfNoneExistExtensionSlice,
  isIfNoneMatchExtensionSlice,
  isResourceIdExtensionSlice,
  isTemplateExtensionSlice
} from './typePredicates';
import { createInvalidWarningIssue } from './operationOutcome';

// Only doing on the Questionnaire for now
export function hasExtractTemplateExtension(item: QuestionnaireItem | Questionnaire): {
  extractTemplate: ExtractTemplate | null;
  warning?: OperationOutcomeIssue;
} {
  if (!item.extension || item.extension.length === 0) {
    return {
      extractTemplate: null
    };
  }

  const extractTemplateExtension = item.extension.find(
    (extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
  );

  if (!extractTemplateExtension) {
    return {
      extractTemplate: null
    };
  }

  const itemId = 'linkId' in item ? item.linkId : 'QuestionnaireLevel';
  const extractTemplateSlices = extractTemplateExtension.extension ?? [];
  const cardinalityWarningStrings: string[] = [];
  let templateCount = 0;
  const seenSliceNames = new Set<string>();

  const extractTemplate: Partial<ExtractTemplate> = {};

  for (const slice of extractTemplateSlices) {
    // Check if the slice has nested extensions
    if (slice.extension && slice.extension.length > 0) {
      cardinalityWarningStrings.push(
        `Extension slice with url "${slice.url}" must not have nested extensions (0..0).`
      );
    }

    if (isTemplateExtensionSlice(slice)) {
      if (templateCount === 0) {
        extractTemplate.template = slice;
      }
      templateCount++;
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
      extractTemplate.fullUrl = slice;
      continue;
    }

    if (isResourceIdExtensionSlice(slice)) {
      extractTemplate.resourceId = slice;
      continue;
    }

    if (isIfNoneMatchExtensionSlice(slice)) {
      extractTemplate.ifNoneMatch = slice;
      continue;
    }

    if (isIfModifiedSinceExtensionSlice(slice)) {
      extractTemplate.ifModifiedSince = slice;
      continue;
    }

    if (isIfMatchExtensionSlice(slice)) {
      extractTemplate.ifMatch = slice;
      continue;
    }

    if (isIfNoneExistExtensionSlice(slice)) {
      extractTemplate.ifNoneExist = slice;
    }
  }

  // extension.template slice is required, and it should only appear once
  if (!extractTemplate.template) {
    return {
      extractTemplate: null,
      warning: createInvalidWarningIssue(
        `sdc-questionnaire-templateExtract found in ${itemId}, but missing required "template" slice.`
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
    extractTemplate: extractTemplate as ExtractTemplate,
    ...(warning && { warning: warning })
  };
}

/**
 * Traverses a FHIR Questionnaire and collects all `sdc-questionnaire-templateExtract` extensions
 * that contain a required `template` slice. Also includes the Questionnaire-level extension if present.
 *
 * @param questionnaire - The FHIR Questionnaire resource to process.
 * @returns A Map where each key is a `QuestionnaireItem.linkId`, or 'QuestionnaireLevel', and the value is the extract template slice set.
 */
export function collectExtractTemplates(questionnaire: Questionnaire): {
  extractTemplateMap: Map<string, ExtractTemplate>;
  extractTemplateWarnings: OperationOutcomeIssue[];
} {
  const extractTemplateMap = new Map<string, ExtractTemplate>();
  const extractTemplateWarnings: OperationOutcomeIssue[] = [];

  // Handle Questionnaire-level extension
  const { extractTemplate, warning } = hasExtractTemplateExtension(questionnaire);
  if (extractTemplate) {
    extractTemplateMap.set('QuestionnaireLevel', extractTemplate);
  }

  if (warning) {
    extractTemplateWarnings.push(warning);
  }

  // Handle item-level extensions
  if (questionnaire.item) {
    for (const item of questionnaire.item) {
      collectExtractTemplateRecursive(item, extractTemplateMap, extractTemplateWarnings);
    }
  }

  return { extractTemplateMap, extractTemplateWarnings };
}

/**
 * Recursively walks through a QuestionnaireItem tree, extracting `templateExtract` extensions
 * and populating a map with entries where the required `template` slice exists.
 *
 * @param qItem - The QuestionnaireItem to evaluate.
 * @param extractTemplateMap - A Map to populate with extracted template slices, keyed by `linkId`.
 * @param extractTemplateWarnings - An array to collect any cardinality-related warnings encountered during collection. Each warning is an OperationOutcomeIssue describing missing or extra extensions within a `templateExtract` slice.
 */
function collectExtractTemplateRecursive(
  qItem: QuestionnaireItem,
  extractTemplateMap: Map<string, ExtractTemplate>,
  extractTemplateWarnings: OperationOutcomeIssue[]
): void {
  const { extractTemplate, warning } = hasExtractTemplateExtension(qItem);
  if (extractTemplate) {
    extractTemplateMap.set(qItem.linkId, extractTemplate); // Cast is safe because `template` is required
  }

  if (warning) {
    extractTemplateWarnings.push(warning);
  }

  if (qItem.item) {
    for (const childQItem of qItem.item) {
      collectExtractTemplateRecursive(childQItem, extractTemplateMap, extractTemplateWarnings);
    }
  }
}
