import type { Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type {
  TargetConstraint,
  TargetConstraintExpression,
  TargetConstraintHuman,
  TargetConstraintKey,
  TargetConstraintLocation,
  TargetConstraintSeverity
} from '../../interfaces/targetConstraint.interface';

export function constructTargetConstraint(extension: Extension): TargetConstraint | null {
  const targetConstraintUrl = extension.url;
  const targetConstraintKey = extension.extension?.find(
    (ext) => ext.url === 'key' && typeof ext.valueId === 'string'
  ) as TargetConstraintKey | undefined;

  const targetConstraintSeverity = extension.extension?.find(
    (ext) =>
      ext.url === 'severity' &&
      ext.valueCode &&
      (ext.valueCode === 'error' || ext.valueCode === 'warning')
  ) as TargetConstraintSeverity | undefined;

  const targetConstraintExpression = extension.extension?.find(
    (ext) => ext.url === 'expression' && ext.valueExpression
  ) as TargetConstraintExpression | undefined;

  const targetConstraintHuman = extension.extension?.find(
    (ext) => ext.url === 'human' && ext.valueString
  ) as TargetConstraintHuman | undefined;

  const hasTargetConstraintLocation = extension.extension?.find(
    (ext) => ext.url === 'location' && ext.valueString
  ) as TargetConstraintLocation | undefined;

  if (
    targetConstraintUrl === 'http://hl7.org/fhir/StructureDefinition/targetConstraint' &&
    targetConstraintKey &&
    targetConstraintSeverity &&
    targetConstraintExpression &&
    targetConstraintHuman
  ) {
    return {
      key: targetConstraintKey.valueId,
      severityCode: targetConstraintSeverity.valueCode,
      valueExpression: targetConstraintExpression.valueExpression,
      human: targetConstraintHuman.valueString,
      location: hasTargetConstraintLocation?.valueString
    };
  }

  return null;
}

export function extractTargetConstraints(
  questionnaire: Questionnaire
): Record<string, TargetConstraint> {
  const targetConstraints: Record<string, TargetConstraint> = {};

  // Questionnaire-level extensions
  for (const ext of questionnaire.extension ?? []) {
    const targetConstraint = constructTargetConstraint(ext);
    if (targetConstraint?.key) {
      targetConstraints[targetConstraint.key] = targetConstraint;
    }
  }

  // Item-level extensions (recursive)
  extractTargetConstraintsFromItems(questionnaire.item ?? [], targetConstraints);

  return targetConstraints;
}

function extractTargetConstraintsFromItems(
  items: QuestionnaireItem[],
  targetConstraints: Record<string, TargetConstraint>
) {
  for (const item of items) {
    for (const ext of item.extension ?? []) {
      const targetConstraint = constructTargetConstraint(ext);
      if (targetConstraint?.key) {
        // Record the item's own linkId so the error surfaces on the correct field.
        // readTargetConstraintLocationLinkIds will override this if a location is provided.
        targetConstraint.linkId = item.linkId;
        targetConstraints[targetConstraint.key] = targetConstraint;
      }
    }
    extractTargetConstraintsFromItems(item.item ?? [], targetConstraints);
  }
}
