import type { Expression, Extension } from 'fhir/r4';

export interface TargetConstraint {
  key: string;
  severityCode: 'error' | 'warning';
  valueExpression: Expression;
  human: string;
  location?: string;
  linkId?: string;
  isEnabled?: boolean;
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
