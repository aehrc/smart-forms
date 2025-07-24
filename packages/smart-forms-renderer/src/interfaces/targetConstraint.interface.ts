import type { Expression, Extension } from 'fhir/r4';

/**
 * Represents a FHIR SDC (Structured Data Capture) targetConstraint extension,
 * used to define custom validation rules for Questionnaire items.
 *
 * Each TargetConstraint specifies a unique key, severity, validation expression,
 * and a human-readable error or warning message. Optionally, it can include
 * location or linkId references and a flag indicating validation status.
 */
export interface TargetConstraint {
  /**
   * Unique identifier for this constraint, used for reference and traceability.
   */
  key: string;

  /**
   * The severity of the constraint violation.
   * - 'error': Prevents submission if the constraint fails.
   * - 'warning': Allows submission but alerts the user.
   */
  severityCode: 'error' | 'warning';

  /**
   * The FHIRPath expression that defines the valid condition for the item.
   * Should evaluate to true when the value is valid.
   */
  valueExpression: Expression;

  /**
   * Human-readable message explaining the constraint,
   * shown to users when the constraint fails.
   */
  human: string;

  /**
   * (Optional) FHIRPath location string indicating where the constraint applies.
   */
  location?: string;

  /**
   * (Optional) The linkId of the Questionnaire item this constraint applies to.
   */
  linkId?: string;

  /**
   * (Optional) Indicates if the current value is invalid according to this constraint.
   */
  isInvalid?: boolean;
}

export interface TargetConstraintKey extends Extension {
  url: 'key';
  valueId: string;
}

export interface TargetConstraintSeverity extends Extension {
  url: 'severity';
  valueCode: 'error' | 'warning';
}

export interface TargetConstraintExpression extends Extension {
  url: 'expression';
  valueExpression: Expression;
}

export interface TargetConstraintHuman extends Extension {
  url: 'human';
  valueString: string;
}

export interface TargetConstraintLocation extends Extension {
  url: 'location';
  valueString: string;
}
